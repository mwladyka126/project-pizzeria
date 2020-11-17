import {select,templates} from './../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(bookingWidgetWrapper){
    const thisBooking=this;
    
    thisBooking.render(bookingWidgetWrapper);
    thisBooking.initWidgets();
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