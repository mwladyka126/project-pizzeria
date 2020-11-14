import {select,templates} from './../settings.js';
import AmountWidget from './AmountWidget.js';

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
  }
  initWidgets(){
    const thisBooking=this;

    thisBooking.peopleAmount = new AmountWidget (thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget (thisBooking.dom.hoursAmount);
  }   
}

export default Booking;