const products = {
  brush: {
    id: "brush",
    name: "Escova PufPuf",
    price: 49.90,
    image: "assets/images/escova-pufpuf-rosa-clean.jpg",
    color: "Rosa (soft)"
  },
  cream: {
    id: "cream",
    name: "Creme PufPuf 300 g",
    price: 42.90,
    image: "assets/images/creme-pufpuf-frente.jpg"
  }
};

let cart = JSON.parse(localStorage.getItem("pufpuf-cart") || "[]");
let shipping = 14.90;
let selectedBrush = { color: "rosa", label: "Rosa (soft)", image: "assets/images/escova-pufpuf-rosa-clean.jpg" };

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = (n) => n.toLocaleString("pt-BR", {style:"currency", currency:"BRL"});
function saveCart(){ localStorage.setItem("pufpuf-cart", JSON.stringify(cart)); }

function add(id, qty=1, color=null, image=null){
  const key = color ? `${id}-${color}` : id;
  const item = cart.find(x => x.key === key);
  if(item) item.qty += qty;
  else cart.push({id, key, qty, color, image});
  saveCart(); renderCart(); openCart();
}
function remove(key){ cart = cart.filter(x => x.key !== key); saveCart(); renderCart(); }
function changeQty(key, delta){
  const item = cart.find(x => x.key === key); if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) remove(key); else { saveCart(); renderCart(); }
}
function subtotal(){ return cart.reduce((sum,item)=>sum + products[item.id].price * item.qty,0); }
function renderCart(){
  const count = cart.reduce((s,i)=>s+i.qty,0);
  $("#cartCount").textContent = count;
  const items = $("#cartItems"), empty = $("#cartEmpty"), summary = $("#cartSummary");
  if(!cart.length){ items.innerHTML=""; empty.style.display="block"; summary.style.display="none"; return; }
  empty.style.display="none"; summary.style.display="block";
  items.innerHTML = cart.map(item=>{
    const p=products[item.id];
    const img=item.image || p.image;
    const detail=item.color ? `<small class="cart-color">${item.color}</small>` : "";
    return `<div class="cart-row"><img src="${img}" alt="${p.name}"><div><h4>${p.name}</h4>${detail}<p>${money(p.price)}</p><div class="qty"><button data-action="minus" data-key="${item.key}">−</button><span>${item.qty}</span><button data-action="plus" data-key="${item.key}">+</button></div></div><strong>${money(p.price*item.qty)}</strong></div>`;
  }).join("");
  $("#subtotal").textContent=money(subtotal());
  $("#shipping").textContent=shipping ? money(shipping) : "Grátis";
  $("#total").textContent=money(subtotal()+shipping);
}
function openCart(){ $("#cartDrawer").classList.add("open"); $("#cartDrawer").setAttribute("aria-hidden","false"); document.body.classList.add("no-scroll"); }
function closeCart(){ $("#cartDrawer").classList.remove("open"); $("#cartDrawer").setAttribute("aria-hidden","true"); document.body.classList.remove("no-scroll"); }
function openCheckout(){ if(!cart.length) return; closeCart(); $("#checkoutModal").classList.add("open"); $("#checkoutModal").setAttribute("aria-hidden","false"); document.body.classList.add("no-scroll"); }
function closeCheckout(){ $("#checkoutModal").classList.remove("open"); $("#checkoutModal").setAttribute("aria-hidden","true"); document.body.classList.remove("no-scroll"); }

// Escolha de cores da escova.
$$(".color-option").forEach(btn=>btn.addEventListener("click",()=>{
  $$(".color-option").forEach(x=>x.classList.remove("selected")); btn.classList.add("selected");
  const color=btn.dataset.color, label=btn.dataset.label;
  selectedBrush={color,label,image:`assets/images/escova-pufpuf-${color}-clean.jpg`};
  $("#selectedBrushColor").textContent=label;
  $("#brushProductImage").src=selectedBrush.image;
  $("#brushProductImage").alt=`Escova PufPuf ${label}`;
  $("#heroBrushImage").src=selectedBrush.image;
  $("#heroBrushImage").alt=`Escova PufPuf ${label}`;
}));

$("#addBrush").addEventListener("click",()=>add("brush",1,selectedBrush.color,selectedBrush.image));
const heroBuyBrush = $("#heroBuyBrush");
if(heroBuyBrush) heroBuyBrush.addEventListener("click",()=>add("brush",1,selectedBrush.color,selectedBrush.image));
$$('[data-product="cream"]').forEach(btn=>btn.addEventListener("click",()=>add("cream")));
$$(".add-bundle").forEach(btn=>btn.addEventListener("click",()=>{ add("brush",1,selectedBrush.color,selectedBrush.image); add("cream"); }));
$("#openCart").addEventListener("click",openCart);
$("#closeCart").addEventListener("click",closeCart);
$("#closeCartX").addEventListener("click",closeCart);
$("#goCheckout").addEventListener("click",openCheckout);
$("#closeCheckout").addEventListener("click",closeCheckout);
$("#closeCheckoutX").addEventListener("click",closeCheckout);
$("#cartItems").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; changeQty(b.dataset.key,b.dataset.action==="plus"?1:-1); });

$$(".shipping-option").forEach(btn=>btn.addEventListener("click",()=>{ $$(".shipping-option").forEach(x=>x.classList.remove("selected")); btn.classList.add("selected"); shipping=Number(btn.dataset.price); renderCart(); }));
$("#cep").addEventListener("input",e=>{ let v=e.target.value.replace(/\D/g,"").slice(0,8); if(v.length>5) v=v.slice(0,5)+"-"+v.slice(5); e.target.value=v; });
$("#checkoutForm").addEventListener("submit",e=>{ e.preventDefault(); const name=new FormData(e.currentTarget).get("name"); $("#successName").textContent=name||"cliente"; e.currentTarget.style.display="none"; $(".checkout-head").style.display="none"; $("#success").style.display="block"; });
$("#successClose").addEventListener("click",()=>{ cart=[]; saveCart(); renderCart(); $("#success").style.display="none"; $("#checkoutForm").style.display="block"; $(".checkout-head").style.display="block"; closeCheckout(); });
renderCart();


// Navegação móvel: o carrinho fica sempre a um toque de distância.
const mobileCart = document.querySelector("#mobileCart");
if (mobileCart) mobileCart.addEventListener("click", openCart);

// QR Code para a apresentação na TV. Quando publicado no GitHub Pages,
// o QR aponta automaticamente para a URL real da loja.
function buildQrCode(){
  const target = document.querySelector("#qrCode");
  if (!target || typeof QRCode === "undefined") return;
  target.innerHTML = "";
  new QRCode(target, {
    text: window.location.href.split('#')[0],
    width: 92,
    height: 92,
    colorDark: "#5f0733",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}
function syncMobileCart(){
  const el=document.querySelector("#mobileCartCount");
  if(el) el.textContent=cart.reduce((s,i)=>s+i.qty,0);
}
const oldRenderCart = renderCart;
renderCart = function(){ oldRenderCart(); syncMobileCart(); };
buildQrCode();
syncMobileCart();

// Navegação por tópicos: cada área ocupa a tela inteira, sem rolagem da página.
function activatePanel(name){
  const target = document.querySelector(`#panel-${name}`);
  if(!target) return;
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  target.classList.add('active');
  document.querySelectorAll('[data-panel]').forEach(el=>el.classList.toggle('active', el.dataset.panel===name));
  const menu=document.querySelector('#mobileMenu');
  if(menu) { menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); }
}

document.querySelectorAll('[data-panel]').forEach(el=>{
  el.addEventListener('click',()=>activatePanel(el.dataset.panel));
});

const menuToggle=document.querySelector('#menuToggle');
const closeMenu=document.querySelector('#closeMenu');
const mobileMenu=document.querySelector('#mobileMenu');
if(menuToggle) menuToggle.addEventListener('click',()=>{
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden','false');
});
if(closeMenu) closeMenu.addEventListener('click',()=>{
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden','true');
});

// Reforça a posição inicial e o estado dos controles.
activatePanel('home');
