import {settings,select} from './../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element){
    super(element,settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.maxValue = settings.amountWidget.defaultMax;

    thisWidget.initActions();

    //console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments:' , element);
  }

  getElements(){
    const thisWidget = this;
    
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
  parseValue(value){
    return parseFloat(value);
  }
  isValid(value){
    const thisWidget=this;
    return !isNaN(value)
    && value>=settings.amountWidget.defaultMin
     && value<=thisWidget.maxValue;
  }
  setMaxValue(newMaxValue) {
    const thisWidget = this;
    thisWidget.maxValue = newMaxValue;
  }
  resetMaxValueToDefault() {
    const thisWidget = this;
    thisWidget.maxValue = settings.amountWidget.defaultMax;
  }
  renderValue(){
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.value =thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(event){ event.preventDefault();
      if (thisWidget.dom.linkDecrease.classList.contains('hours')){
        thisWidget.setValue(thisWidget.value-0.5);
      }else{
        thisWidget.setValue(thisWidget.value-1);
      }

    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(event){ event.preventDefault();
      if (thisWidget.dom.linkDecrease.classList.contains('hours')){
        thisWidget.setValue(thisWidget.value+0.5);
      }else{
        thisWidget.setValue(thisWidget.value+1);
      }
    });
  }
}
export default AmountWidget;
  