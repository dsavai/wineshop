//selectors
const productDOM = document.querySelector("[data-product-dom]")
const modalElement = document.querySelector("[data-modal]");
const quantityInput = document.querySelectorAll(".quantity-input")
const cartBtn = document.querySelector("[data-cart-btn]");
const closeCartBtn = document.querySelector("[data-close-cart]");
const cartDOM = document.querySelector("[data-cart]");
const cartOverlay = document.querySelector("[data-cart-overlay]");
const cartItems = document.querySelector("[data-cart-items]")
const cartTotal = document.querySelector("[data-cart-total]");
const cartContent = document.querySelector("[data-cart-content]");
const deliveryDetails = document.querySelector("[data-delivery-details]");
const showFilters = document.querySelector("[data-show-filters]");
const filtersContent = document.querySelector("[data-filters-content]");





//image base url
const BOTTLE_IMAGE_URL = "https://storage.googleapis.com/wineshop-assets/wine-bottles/";

let cart = []

class Products{
    async getProducts(){
        try{
            let result = await fetch("https://storage.googleapis.com/wineshop-assets/wine-shop.json")
            let data = await result.json()
            
            let products = data.map(item => {
                const num = item.no
                const name = item.name
                const image = item.image
                const details = item.details
                const casePrice = item.cost.case
                const bottlePrice = item.cost.bottle
                const tags = item.tags

                return { num, name, image, details,  casePrice, bottlePrice, tags}
            })

            return products

        }catch(error){
            console.log(error)
        }
    }
}


//ui
class Ui{

    filteredProducts(products){
        const filterInputs = [...document.querySelectorAll("[data-filter-item]")]

        filterInputs.forEach(item => {
            item.addEventListener("change", (event) => {
                if(item.checked){
                    const filteredValued = event.target.value
                    const productFilter = products.filter(function (product) {
                        const tags = product.tags.map(item => item)
                        if(tags.includes(filteredValued) || tags === filteredValued){
                            return filteredValued
                        }
                    });

                    if(filteredValued === "all"){
                        this.displayProducts(products)
                        this.showModal(products)
                    }else{
                        this.displayProducts(productFilter)
                        this.showModal(products)
                    }
                }
                
            })
        })

        this.displayProducts(products)
        
    }

    displayProducts(products){
        let results = ""

        products.forEach(product => {
            results += `
            <div class="grid-col-6">
                <div class="product">
                    <div class="product__block">
                        <div class="product__image">
                            <figure class="responsive-image">
                                <img src=${BOTTLE_IMAGE_URL+product.image} alt=${product.name} />
                            </figure>
                        </div>
                        <div class="product__content">
                            <div class="product__details">
                                <div class="product__number">${product.num}</div>
                                <h3 class="product__title">${product.name}</h3>
                            </div>
                            <div class="product__action">
                                <div class="product__action__details">
                                    <div class="product__action__bottle">
                                        <div class="product__action__name">Bottle</div>
                                        <div class="product__action__price">$${product.bottlePrice}</div>
                                        <div class="product__action__quantity">
                                            <input type="number" value="1" min="1" class="quantity-input" data-bottle-quantity/>
                                            <span class="quantity-label">QTY</span>
                                        </div>
                                    </div>
                                    <div class="product__action__case">
                                        <div class="product__action__name">Case</div>
                                        <div class="product__action__price">$${product.casePrice}</div>
                                        <div class="product__action__quantity">
                                            <input type="number" value="1" min="1" class="quantity-input" data-case-quantity required />
                                            <span class="quantity-label">QTY</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="product__action__buttons">
                                    <button class="btn btn--default btn--medium show-details-btn" data-id=${product.num}>Details</button>
                                    <button class="btn btn--primary btn--medium bag-btn" data-id=${product.num}>Add to cart</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `
        });
        
        productDOM.innerHTML = results
    }

    showModal(products){
        const buttons = [...document.querySelectorAll(".show-details-btn")]
        buttons.forEach(button => {
            const id = button.dataset.id
            
            if(id){
                button.addEventListener("click", (event) => {
                    event.preventDefault()
                    const modalProduct = products.filter(item => item.num === id)
                    this.modal(modalProduct)
                })
            }
        })

    }

    modal(product){
        let modal = `
            <div class="modal__container">
                <div class="modal__content">
                    <header class="modal__header">
                        <h3 class="modal__header__title">${product[0].name}</h3>
                        <div class="modal__header__close" data-close-modal>&#x2715</div>
                    </header>
                    <footer class="modal__header__footer">
                        <p>${product[0].details}.</p>
                    </footer>
                </div>
            </div>
        `;
        
        modalElement.classList.add("show-modal")
        modalElement.innerHTML = modal

        this.closeModal()
    }

    closeModal(){
        const closeBtn = document.querySelector("[data-close-modal]")
        closeBtn.addEventListener("click", () => {
            modalElement.classList.remove("show-modal")
        })
    }

    getCartButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];

        buttons.forEach(button => {
            const id = button.dataset.id
            let inCart = cart.find(item => item.num === id)

            if(inCart){
                button.innerText = "in cart"
                button.disabled = true
            }else{
                button.addEventListener("click", (event) => {
                    event.preventDefault()
                    let caseQuantity = document.querySelector("[data-case-quantity]").value
                    let bottleQuantity = document.querySelector("[data-bottle-quantity]").value

                    
                    event.target.innerText = "in cart"
                    button.disabled = true

                    let cartItem = {...Storage.getProducts(id), caseAmount: Math.floor(caseQuantity), bottleAmount: Math.floor(bottleQuantity), amount: 1}
                    
                    console.log(cartItem)

                    cart = [...cart, cartItem]
                    
                    Storage.saveCart(cart)
                    
                    // add to DOM
                    this.setCartValues(cart);
                    this.addCartItem(cartItem);
                    this.showCart()
                })
            }
        })
    }

    setCartValues(cart){
        let tempTotal = 0
        let itemsTotal = 0

        cart.map(item => {
            tempTotal += (item.caseAmount * item.casePrice) + (item.bottleAmount * item.bottlePrice)
            itemsTotal += item.amount
        })

        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;

    }

    addCartItem(item) {
        const div = document.createElement("div")
        div.classList.add("cart-item")
        const totalItemPrice = (item.bottleAmount * item.bottlePrice) + (item.caseAmount * item.casePrice)

        div.innerHTML = `
            <img src=${BOTTLE_IMAGE_URL + item.image} alt=${item.name} class="cart-item__image" />
            <div class="cart-item__details">
                <h4 class="cart-item__name">${item.name}</h4>
                <h5 class="cart-item__price">${totalItemPrice.toFixed(2)}</h5>
                <span class="remove-item" data-id=${item.num}>remove</span>
            </div>
        `;

        cartContent.appendChild(div);
    }

    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
        cart.length >= 1 ? deliveryDetails.classList.add("show-details") : null
    }

    hideCart(event) {
        event.preventDefault()
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }

    setupCartAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    cartLogic(){
        cartContent.addEventListener("click", (event) => {
            if(event.target.classList.contains("remove-item")){
                let removeItem = event.target
                let id = removeItem.dataset.id

                cart = cart.filter(item => item.num !== id)
                this.setCartValues(cart)
                Storage.saveCart(cart)

                cartContent.removeChild(removeItem.parentElement.parentElement)

                const buttons = [...document.querySelectorAll(".bag-btn")];

                buttons.forEach(button => {
                    if (parseInt(button.dataset.id) === id) {
                      button.disabled = false;
                      button.innerHTML = `add to bag`;
                    }
                })
            }
        })
    }

}

class Storage{
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProducts(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.num === id);
    }

    static saveCart(cart){
        localStorage.setItem("cart", JSON.stringify(cart))
    }

    static getCart(){
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : []
    }

}

//DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
    const ui = new Ui()
    const products = new Products()

    ui.setupCartAPP()

    products.getProducts().then(products => {
        ui.filteredProducts(products)
        ui.showModal(products)
        Storage.saveProducts(products)
    }).then(() => {
        ui.getCartButtons()
        ui.cartLogic()
    })
})


//show filters
showFilters.addEventListener("click", (event) => {
    filtersContent.classList.toggle("show-filters")
})