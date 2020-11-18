import {select,settings,templates} from './../settings.js';
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
    
    fetch(urls.booking)
      .then(function(bookingsResponse){
        return bookingsResponse.json();
      })
      .then(function(bookings){
        console.log(bookings);
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
  }
  initWidgets(){
    const thisBooking=this;

    thisBooking.peopleAmount = new AmountWidget (thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget (thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }   
}

export default Booking;