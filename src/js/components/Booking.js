import {select,settings,templates, classNames} from './../settings.js';
import {utils} from './../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(bookingWidgetWrapper){
    const thisBooking=this;
    
    thisBooking.render(bookingWidgetWrapper);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.selectTable();
  }
  getData(){
    const thisBooking=this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking:[
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    
    console.log('getData params', params);

    const urls = {
      booking:        settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&') ,
      eventsCurrent:  settings.db.url + '/' + settings.db.event + '?'   + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.event + '?'   + params.eventsRepeat.join('&'),
    };
    console.log('getData urls', urls);
    
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings,eventsCurrent,eventsRepeat);
      });
  }
  
  parseData(bookings,eventsCurrent,eventsRepeat){
    const thisBooking= this;

    thisBooking.booked ={};

    for (let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration,item.table);
    }

    for (let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration,item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate<=maxDate;loopDate=utils.addDays(loopDate,1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration,item.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date,hour,duration,table){
    const thisBooking= this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] ={};
    }
    const startHour = utils.hourToNumber(hour);
    
    for(let hourBlock=startHour; hourBlock < startHour + duration; hourBlock+=0.5){

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] =[];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM (){
    const thisBooking=this;

    thisBooking.date=thisBooking.datePicker.value;
    thisBooking.hour= utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;      
      thisBooking.hoursAmount.resetMaxValueToDefault();
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)){
        tableId=parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
        table.classList.remove(classNames.booking.tableClicked);
      }else{
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
  selectTable(){
    const thisBooking=this;
    const bookingButton=document.querySelector(select.booking.button);
    bookingButton.disabled=true;

    
    const tables=thisBooking.dom.tables;

    for (let table of tables){
      table.addEventListener('click',function(){
        bookingButton.disabled=false;
        if (
          !table.classList.contains(classNames.booking.tableBooked)       
        ){ 
          table.classList.toggle(classNames.booking.tableClicked);
               
          let tableId = table.getAttribute(settings.booking.tableIdAttribute);
          if (!isNaN(tableId)){
            tableId= parseInt(tableId);
          }
          thisBooking.clickedTable=tableId;
          thisBooking.checkAvailability(tableId);             
        }   
      });        
    }
  } 
  
  checkAvailability(tableId){
    const thisBooking =this;
    
    thisBooking.date=thisBooking.datePicker.value;
    thisBooking.hour= utils.hourToNumber(thisBooking.hourPicker.value);
    const closeHour= settings.hours.close;
    thisBooking.duration=thisBooking.hoursAmount.value;
    let maxHour= 0;

    for(let hourBlock=thisBooking.hour; hourBlock < closeHour; hourBlock+=0.5){
      if(
        typeof thisBooking.booked[thisBooking.date] ==='undefined'||
        typeof thisBooking.booked[thisBooking.date][hourBlock] ==='undefined'||
        !thisBooking.booked[thisBooking.date][hourBlock].includes(tableId)
      ){
        maxHour += 0.5;
      }else{
        break;
      }
    }
    thisBooking.hoursAmount.setMaxValue(maxHour);
  }
  
  sendOrder(){
    const thisBooking =this;
    
    const url= settings.db.url + '/' + settings.db.booking;
    const booking ={
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table:thisBooking.clickedTable,
      duration:thisBooking.hoursAmount.value,
      people:thisBooking.peopleAmount.value,
      starters:[],
      phone:thisBooking.dom.phone.value,
      address:thisBooking.dom.address.value,
    };

    for (let starter of thisBooking.dom.starters){
      if (starter.checked==true){
        booking.starters.push[starter.value];
      }
    }

    const bookedTable= thisBooking.dom.wrapper.querySelector(select.booking.tables+'[data-table="'+thisBooking.clickedTable+'"]');
    
    bookedTable.classList.remove('clicked');
     

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse',parsedResponse);
        thisBooking.getData();
      });  
  }

  render(bookingWidgetWrapper){
    const thisBooking=this;

    const generateHTML= templates.bookingWidget();
    thisBooking.dom={};
    
    thisBooking.dom.wrapper= bookingWidgetWrapper;
    bookingWidgetWrapper.innerHTML =generateHTML;

    thisBooking.dom.peopleAmount =bookingWidgetWrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = bookingWidgetWrapper.querySelector(select.booking.hoursAmount);  
    thisBooking.dom.datePicker=bookingWidgetWrapper.querySelector(select.widgets.datePicker.wrapper); 
    thisBooking.dom.hourPicker=bookingWidgetWrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = bookingWidgetWrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.starters = bookingWidgetWrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.phone =bookingWidgetWrapper.querySelector(select.booking.phone);
    thisBooking.dom.address =bookingWidgetWrapper.querySelector(select.booking.address);
    thisBooking.dom.form=bookingWidgetWrapper.querySelector(select.booking.form);

  }
  initWidgets(){
    const thisBooking=this;

    thisBooking.peopleAmount = new AmountWidget (thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget (thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
    thisBooking.dom.form.addEventListener('submit',function(){
      event.preventDefault();
      thisBooking.sendOrder();     
    });
  }   
}

export default Booking;