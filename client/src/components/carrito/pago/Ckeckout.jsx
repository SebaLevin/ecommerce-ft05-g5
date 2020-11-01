import React, { useEffect, useState } from 'react';
import './Checkout.css';
import { useDispatch, useSelector } from 'react-redux';
import { formatProducts } from '../../../utils/utils.js';
import credito from '../../../img/credito.png';
import img_credito from '../../../img/credit-card.png';
import img_debito from '../../../img/d-card.png';
import img_efectivo from '../../../img/p-card.png';
import rapipago from '../../../img/rapipago.png';
import pagofacil from '../../../img/pagofacil.png';
import Confetti from 'react-confetti';
import axios from 'axios';
import bag from '../../../img/bag.png'

export default function Checkout() {
    let userId = localStorage.getItem('id')
    let countCart = localStorage.getItem('count')
    let product = JSON.parse(localStorage.getItem('prod'))
    let subtotal = 0
    let envio = 0
    let total = 0

    const [values, setValues] = useState({
        name: '',
        lastname: '',
        email: '',
        address: ''
    });

    const [error, setError] = useState({});
    const config = {
        angle: "161",
        spread: 360,
        startVelocity: "16",
        elementCount: "121",
        dragFriction: "0.03",
        duration: "5810",
        stagger: "19",
        width: "32px",
        height: "35px",
        perspective: "500px",
        colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
      };
 

    //INICIO FUNCIONES DE MERCADO PAGO!

    window.Mercadopago.setPublishableKey("TEST-883a2064-2595-42bf-ba5c-ce661de4a25c");
    window.Mercadopago.getIdentificationTypes();

    //Proceed with payment
    var doSubmit = false;
    async function onSubmit(e) {
        e.preventDefault();
        let formCash = {
            transactionAmount: total.toFixed(2),
            description: 'compra',
            paymentMethodId: document.getElementById('rapipago').checked ? 'rapipago' : 'pagofacil',
            email: document.getElementById('email').value,
            userId: document.getElementById('userId').value,
            products: document.getElementById('products').value
        };
        if (!doSubmit) {
            if (document.getElementById('ck2a').checked) {
                axios.post('http://localhost:3001/process_payment', formCash)
                    .then(response => {
                        localStorage.removeItem('prod');
                        localStorage.removeItem('count');
                        return response;
                    });
            } else {
                let $form = document.getElementById('paymentForm');
                window.Mercadopago.createToken($form, setCardTokenAndPay);
                return false;
            }
        }
    }

    function setCardTokenAndPay(status, response) {
        if (status == 200 || status == 201) {
            let form = document.getElementById('paymentForm');
            let card = document.createElement('input');
            card.setAttribute('name', 'token');
            card.setAttribute('type', 'hidden');
            card.setAttribute('value', response.id);
            form.appendChild(card);
            doSubmit = true;
            form.submit();
            localStorage.removeItem('prod');
            localStorage.removeItem('count');
        } else {
            alert("Error en los datos!\n" + JSON.stringify(response, null, 4));
        }
    };

    function guessPaymentMethod(e) {
        e.preventDefault();
        cleanCardInfo();
        let cardNum = e.target.value;
        if (cardNum >= 6) {
            let bin = cardNum.substring(0, 6);
            window.Mercadopago.getPaymentMethod({
                "bin": bin
            }, setPaymentMethod);
            getIssuers();
        }
    };

    function setPaymentMethod(status, response) {
        try {
            if (status == 200) {
                let paymentMethod = response[0];
                console.log(paymentMethod);
                if (document.getElementById('ck2c').checked && paymentMethod.id.slice(0, 3) === 'deb') {
                    alert('Ingresar una tarjeta de crébito válida!');
                    document.getElementById('cardNumber').value = '';
                    return;
                }
                if (document.getElementById('ck2b').checked && paymentMethod.id.slice(0, 3) !== 'deb') {
                    alert('Ingresar una tarjeta de débito válida!');
                    document.getElementById('cardNumber').value = '';
                    return;
                }
                document.getElementById('paymentMethodId').value = paymentMethod.id;
                document.getElementById('cardNumber').style.backgroundImage = 'url(' + paymentMethod.thumbnail + ')';

                if (paymentMethod.additional_info_needed.includes("issuer_id")) {
                    getIssuers(paymentMethod.id);

                }
                else {
                    document.getElementById('issuerInput').classList.add("hidden");
                    if (paymentMethod.id.slice(0, 3) !== 'deb') {
                        getInstallments(
                            paymentMethod.id,
                            document.getElementById('amount').value
                        );
                    }
                }
            } else {
                alert(`payment method info error: ${response}`);
            }
        } catch (error) {
            console.log(error);
        }

    }

    function cleanCardInfo() {
        document.getElementById('cardNumber').style.backgroundImage = '';
        document.getElementById('issuerInput').classList.add("hidden");
        document.getElementById('issuer').options.length = 0;
        document.getElementById('installments').options.length = 0;
    };

    function getIssuers(paymentMethodId) {
        window.Mercadopago.getIssuers(
            paymentMethodId,
            setIssuers
        );
    }

    function setIssuers(status, response) {
        if (status == 200) {
            let issuerSelect = document.getElementById('issuer');

            response.forEach(issuer => {
                let opt = document.createElement('option');
                opt.text = issuer.name;
                opt.value = issuer.id;
                issuerSelect.appendChild(opt);
            });

            if (issuerSelect.options.length <= 1) {
                document.getElementById('issuerInput').classList.add("hidden");
            } else {
                document.getElementById('issuerInput').classList.remove("hidden");
            }

            getInstallments(
                document.getElementById('paymentMethodId').value,
                document.getElementById('amount').value,
                issuerSelect.value
            );

        } else {
            return
        }
    }

    function getInstallments(paymentMethodId, amount, issuerId) {
        window.Mercadopago.getInstallments({
            "payment_method_id": paymentMethodId,
            "amount": parseFloat(amount),
            "issuer_id": issuerId ? parseInt(issuerId) : undefined
        }, setInstallments);
    }

    function setInstallments(status, response) {
        if (status == 200) {
            console.log('response: ', response[0].payer_costs);
            document.getElementById('installments').options.length = 0;
            response[0].payer_costs.forEach(payerCost => {
                let opt = document.createElement('option');
                opt.text = payerCost.recommended_message;
                opt.value = payerCost.installments;
                document.getElementById('installments').appendChild(opt);
            });
        } else {
            alert(`installments method info error: ${response}`);
        }
    }

    //FIN FUNCIONES DE MERCADO PAGO!

    const handleChange = e => {
        e.preventDefault();
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value
        });
        setError(validate({
            ...values,
            [name]: value
        }));
    }

    function validate(input) {
        let errors = {};

        if (!input.name) {
            errors.name = 'Este campo es requerido';
        }
        else if (typeof input.name !== 'string') {
            errors.name = 'El nombre solo puede contener letras'
        }
        else if (input.name.length < 3) {
            errors.name = 'El nombre debe contener como minimo 3 letras';
        }

        if (!input.lastname) {
            errors.lastname = 'Este campo es requerido';
        }

        if (!input.email) {
            errors.email = 'Este campo es requerido';
        }
        else if (!(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).test(input.email)) {
            errors.email = 'El mail debe ser valido'
        }
        if (!input.address) {
            errors.address = 'Este campo es requerido';
        }

        setError(errors)
        return errors;
    }

    function checkMedioDePago(e) {
        const checkboxSelected = e.target.id;
        if (checkboxSelected === 'ck2a') {
            document.getElementById('metodos-pago-efectivo').style.display = 'block';
            document.getElementById('metodos-pago-debito').style.display = 'none';
            document.getElementById('metodos-pago').style.display = 'none';
            document.getElementById('metodos-pago-credito').style.display = 'none';
        }
        if (checkboxSelected === 'ck2b') {
            document.getElementById('metodos-pago-efectivo').style.display = 'none';
            document.getElementById('metodos-pago-debito').style.display = 'block';
            document.getElementById('metodos-pago').style.display = 'none';
            document.getElementById('metodos-pago-credito').style.display = 'none';
            document.getElementById('pagofacil').checked = false;
            document.getElementById('rapipago').checked = false;
            document.getElementById('cardNumber').value = '';
        }
        if (checkboxSelected === 'ck2c') {
            document.getElementById('metodos-pago-efectivo').style.display = 'none';
            document.getElementById('metodos-pago-debito').style.display = 'block';
            document.getElementById('metodos-pago').style.display = 'block';
            document.getElementById('metodos-pago-credito').style.display = 'block';
            document.getElementById('pagofacil').checked = false;
            document.getElementById('rapipago').checked = false;
            document.getElementById('cardNumber').value = '';
        }
    }



    return (
        <div className="container">
            <div className="container-checkout">
                <div className="py-5 text-center cabecera-pago">
                    <h2 className="h4-checkout">Datos de envio y pago</h2>
                </div>
                <div className="row">
                    <div className="col-md-4 order-md-2 mb-4">
                        <h4 className="d-flex justify-content-between align-items-center mb-3 h4-checkout-item">
                            <h4 className="text-dark mb-3 h4-checkout">Tu carrito</h4><a className="text-warning stretched-link" href='./carrito'><small>editar</small></a>
                            <span className="badge badge-secondary badge-pill">{countCart}</span>
                        </h4>
                        <ul className="list-group mb-3 sticky-top ul-carrito">
                            {product !== undefined && product.map(prod => {
                                subtotal = subtotal + (prod.price * prod.count)
                                envio = envio + subtotal * 0.1
                                total = total + (subtotal + envio)
                                return (
                                    <li className="list-group-item d-flex justify-content-between lh-condensed">
                                        <div className='row'>
                                            <img src={prod.image} width={60} />
                                            <div class="col-sm-6 col-xs-6">
                                                <div class="col-xs-12">{prod.name.substring(0, 9) + '...'}</div>
                                                <div class="col-xs-12"><small>Cantidad:<span>{prod.count}</span></small></div>
                                            </div>
                                        </div>
                                        <span className="text-muted">$ {prod.count * prod.price}</span>
                                    </li>)
                            }
                            )}
                            <li className="list-group-item d-flex justify-content-between">
                                <span>Subtotal</span>
                                <strong>{subtotal.toFixed(2)}</strong>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span>Envio</span>
                                <strong>{envio.toFixed(2)}</strong>
                            </li>
                            <li className="list-group-item d-flex justify-content-between bg-light li-total">
                                <div className="text-success">
                                    <h6 className="my-0 total-carrito">Total:</h6>
                                </div>
                                <span className="text-success span-total-num">{`$ ${total.toFixed(2)}`}</span>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-8 order-md-1 margen-derecho">
                        <h4 className="mb-3 h4-checkout">Direccion de envio</h4>
                        <form action="http://localhost:3001/process_payment" method="post" id="paymentForm" onSubmit={(e) => { onSubmit(e) }}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label for="firstName" className="label-form">Nombres</label>
                                    <input name='name' type="text" className="form-control input-direccion" id="firstName" placeholder="Patricio" onChange={handleChange} />
                                    {error.name && <p className='danger'>{error.name}</p>}
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label for="lastName" className="label-form">Apellidos</label>
                                    <input name='lastname' type="text" className="form-control input-direccion" id="lastName" placeholder="Estrella" onChange={handleChange} />
                                    {error.lastname && <p className='danger'>{error.lastname}</p>}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label for="email" className="label-form">Email <span className="text-muted"></span></label>
                                <input type="text" name="email" className="form-control input-direccion" id="email" placeholder="tu@email.com" onChange={handleChange} />
                                {error.email && <p className='danger'>{error.email}</p>}
                            </div>
                            <div className="col-md-12 row">
                                <div className="col-md-4 row">
                                    <label for="docType" className="label-form">Tipo de documento</label>
                                    <select id="docType" name="docType" className="form-control input-direccion" data-checkout="docType" type="text">DNI</select>
                                </div>
                                <div className="col-md-1 row">

                                </div>
                                <div className="col-md-5 row">
                                    <label for="docNumber" className="label-form">Número de documento</label>
                                    <input id="docNumber" name="docNumber" className="form-control input-direccion" data-checkout="docNumber" type="text" placeholder="13246587" />
                                </div>
                                <div className="col-md-1 row">
                                </div>
                                <div className="col-md-3">
                                    <label for="zip" className="label-form">Codigo postal</label>
                                    <input type="text" className="form-control input-direccion" id="zip" placeholder="5000" required="" />
                                    <div className="invalid-feedback"> Zip code required. </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label for="address" className="label-form">Dirección</label>
                                <input name="address" type="text" className="form-control input-direccion" id="address" placeholder="Calle Wallaby 42" onChange={handleChange}/>
                                {error.address && <p className='danger'>{error.address}</p>}
                            </div>

                            <div className="row">
                                <div className="col-md-5 mb-3">
                                    <label for="country" className="label-form">Pais</label>
                                    <select className="custom-select d-block w-100 input-direccion" id="country" required="">
                                        <option value="">Elige...</option>
                                        <option>Argentina</option>
                                        <option>Brasil</option>
                                        <option>Bolivia</option>
                                        <option>Chile</option>
                                        <option>Peru</option>
                                        <option>Uruguay</option>
                                    </select>
                                    <div className="invalid-feedback"> Please select a valid country. </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label for="state" className="label-form">Provincia</label>
                                    <select className="custom-select d-block w-100 input-direccion" id="state" required="">
                                        <option value="">Elige...</option>
                                        <option>Buenos Aires</option>
                                        <option>Catamarca</option>
                                        <option>Chaco</option>
                                        <option>Chubut</option>
                                        <option>Córdoba</option>
                                        <option>Corrientes</option>
                                        <option>Entre Ríos</option>
                                        <option>Formosa</option>
                                        <option>Jujuy</option>
                                        <option>La Pampa</option>
                                        <option>La Rioja</option>
                                        <option>Mendoza</option>
                                        <option>Misiones</option>
                                        <option>Neuquén</option>
                                        <option>Río Negro</option>
                                        <option>Salta</option>
                                        <option>San Juan</option>
                                        <option>San Luis</option>
                                        <option>Santa Cruz</option>
                                        <option>Santa Fe</option>
                                        <option>S. del Estero</option>
                                        <option>T. del Fuego</option>
                                        <option> Tucumán</option>
                                    </select>
                                </div>

                            </div>
                            <hr className="mb-4" />
                            <h4 className="mb-3">Elige el medio de pago</h4>
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="custom-control custom-radio image-checkbox">
                                        <input type="radio" className="custom-control-input" id="ck2a" name="ck2" onClick={checkMedioDePago} />
                                        <label className="custom-control-label" for="ck2a">
                                            <img src={img_efectivo} alt="#" className="img-fluid" />
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="custom-control custom-radio image-checkbox">
                                        <input type="radio" className="custom-control-input" id="ck2b" name="ck2" onClick={checkMedioDePago} />
                                        <label className="custom-control-label" for="ck2b">
                                            <img src={img_debito} alt="#" className="img-fluid" />
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="custom-control custom-radio image-checkbox">
                                        <input type="radio" className="custom-control-input" id="ck2c" name="ck2" onClick={checkMedioDePago} />
                                        <label class="custom-control-label" for="ck2c">
                                            <img src={img_credito} alt="#" className="img-fluid" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <hr className="mb-4" />

                            {/* INICIO DIV EFECTIVO */}

                            <div id="metodos-pago-efectivo" style={{ display: 'none' }}>
                                <h4 className="mb-3">Seleccione el tipo de pago a generarse</h4>
                                <div className="row">
                                    <div className="col-md-2"></div>
                                    <div className="col-md-4">
                                        <div className="custom-control custom-radio image-checkbox">
                                            <input type="radio" className="custom-control-input" id="rapipago" name="ck3" onClick={checkMedioDePago} />
                                            <label class="custom-control-label" for="rapipago">
                                                <img src={rapipago} alt="#" className="img-fluid" />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="custom-control custom-radio image-checkbox">
                                            <input type="radio" className="custom-control-input" id="pagofacil" name="ck3" onClick={checkMedioDePago} />
                                            <label class="custom-control-label" for="pagofacil">
                                                <img src={pagofacil} alt="#" className="img-fluid" />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-md-2"></div>
                                </div>
                            </div>

                            {/* FIN DIV EFECTIVO */}

                            {/* INICIO DIV TARJETA DE DEBITO */}

                            <div id="metodos-pago-debito" style={{ display: 'none' }}>
                                <h4 className="mb-3">Datos de la Tarjeta</h4>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label for="cc-name" className="label-form">Nombre del titular</label>
                                        <input type="text" className="form-control input-direccion" id="cc-name" placeholder="" required="" data-checkout="cardholderName" />
                                        <small className="text-muted">El Nombre que figura en la tarjeta</small>
                                        <div className="invalid-feedback"> Name on card is required </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label for="cc-number" className="label-form">Numero de tarjeta</label>
                                        <input type="text" className="form-control input-direccion input-background" id="cardNumber" data-checkout="cardNumber" placeholder="" required="" onselectstart="return false"
                                            onCopy="return false" onCut="return false"
                                            onDrag="return false" onDrop="return false" autoComplete="off" onBlur={guessPaymentMethod} />
                                        <div className="invalid-feedback"> Trajeta de Crédito requerida </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-5 mb-3">
                                        <label for="cc-expiration" className="label-form">Fecha de Vencimiento</label>
                                        <div className="col-md-5 expiration">
                                            <input className="form-control input-direccion" type="text" placeholder="MM" id="cardExpirationMonth" data-checkout="cardExpirationMonth"
                                                onselectstart="return false" onPaste="return false"
                                                onCopy="return false" onCut="return false"
                                                onDrag="return false" onDrop="return false" autoComplete="off" />
                                        </div>
                                        <div className="col-md-1 expiration">
                                            <span class="date-separator">/</span>
                                        </div>
                                        <div className="col-md-5 expiration">
                                            <input className="form-control input-direccion" type="text" placeholder="YY" id="cardExpirationYear" data-checkout="cardExpirationYear"
                                                onselectstart="return false" onPaste="return false"
                                                onCopy="return false" onCut="return false"
                                                onDrag="return false" onDrop="return false" autoComplete="off" />
                                        </div>
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label for="cc-cvv" className="label-form">CVV</label>
                                        <input className="form-control input-direccion" id="cc-cvv securityCode" placeholder="123" required="" data-checkout="securityCode" type="text"
                                            onselectstart="return false" onPaste="return false"
                                            onCopy="return false" onCut="return false"
                                            onDrag="return false" onDrop="return false" autoComplete="off" />
                                        <div className="invalid-feedback"> Codigo de Seguridad Requerido </div>
                                    </div>
                                    <div className="col-md-4 mb-3" id="metodos-pago" style={{ display: 'none' }}>
                                        <div id="issuerInput">
                                            <label for="issuer" className="label-form">Banco emisor</label>
                                            <br />
                                            <select id="issuer" name="issuer" className="form-control input-direccion" data-checkout="issuer"></select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4 mb-3" id="metodos-pago-credito" style={{ display: 'none' }}>
                                    <label for="installments" className="label-form">Cuotas</label>
                                    <select type="text" id="installments" name="installments" className="form-control input-direccion"></select>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <input type="hidden" name="transactionAmount" id="amount" value={total.toFixed(2)} />
                                    <input type="hidden" name="paymentMethodId" id="paymentMethodId" />
                                    <input type="hidden" name="description" id="description" value="compra" />
                                </div>
                            </div>

                            <hr className="mb-4" />
                            { !values.email || error.email || error.address ? <button className="btn btn-primary btn-lg btn-block" type="submit" disabled>Confirmar tu compra</button> : 
                            <button className="btn btn-primary btn-lg btn-block" type="submit" >Confirmar tu compra</button>}
                            
                            <input style={{display: "none"}} name='userId' value={localStorage.getItem('id')}/>
                            <input style={{display: "none"}} name='products' value={JSON.stringify(formatProducts(product))}/>
                            

                        </form>
                        
                        <a href="#myModal"  class="btn btn-primary" data-toggle="modal">Launch modal</a>
<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-hidden="true">
<Confetti active={ true} config={ config }/>
    <div class="modal-dialog modal-full" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="modal-body p-4" id="result">
                <h1>Gracias por su compra</h1>
                <img src={bag} width={150} alt='bag'/>
            </div>
            <p>Le enviamos un mail con los detalles de su compra</p>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">OK</button>
            </div>
        </div>
    </div>
</div>

                    </div>
                </div>
            </div>
        </div>
    )
}