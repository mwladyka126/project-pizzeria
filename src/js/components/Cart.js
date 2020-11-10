import {settings, select, classNames, templates} from './../settings.js';
import {utils} from './../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;
      
    thisCart.products = [];

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.getElements(element);
    thisCart.initActions();

    //console.log('new Cart', thisCart);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};
    console.log(thisCart.dom);

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger =element.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList =element.querySelector(select.cart.productList);
    thisCart.dom.form =element.querySelector(select.cart.form);
    thisCart.dom.phone =element.querySelector(select.cart.phone);
    thisCart.dom.address =element.querySelector(select.cart.address);
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for(let key of thisCart.renderTotalsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }

  initActions(){
    const thisCart = this; 
    thisCart.dom.toggleTrigger.addEventListener('click',function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('update',function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit',function(){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct){
    const thisCart =this;
    console.log ('thisCart', thisCart);

    const generateHTML = templates.cartProduct(menuProduct);

    const generatedDOM = utils.createDOMFromHTML (generateHTML);

    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push( new CartProduct(menuProduct,generatedDOM));
    //console.log('thisCart.products',thisCart.products);

    //console.log ('adding product', menuProduct);
    thisCart.update();
  }
  update(){
    const thisCart=this;

    thisCart.totalNumber=0;
    thisCart.subtotalPrice=0;

    for(let product of thisCart.products){
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    //console.log('thisCart.totalNumber:',thisCart.totalNumber);
    //console.log('thisCart.totalPrice:',thisCart.totalPrice);
    //console.log('thisCart.subtotalPrice:',thisCart.sutotalPrice);
    for(let key of thisCart.renderTotalsKeys){
      for(let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }
  remove(cartProduct){
    const thisCart=this;

    const indexOfProduct=thisCart.products.indexOf(cartProduct);

    thisCart.products.splice(indexOfProduct,1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }
  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      contactPhone: thisCart.dom.phone,
      contactAddress: thisCart.dom.address,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      totalPrice: thisCart.totalPrice,
      deliveryFee: thisCart.dom.deliveryFee,
      products : [],
    };

    for (let product of thisCart.products) {
      const productData = product.getData();
      payload.products.push[productData];
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse',parsedResponse);
      });
  }
}
export default Cart;