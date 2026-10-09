const PRODUCTS = [
  {id:'classic-black',name:'Classic Black Uniform Shoe',category:'Primary & secondary',price:18500,description:'A clean everyday uniform shoe with a polished finish.',filters:['primary','secondary'],badge:'BEST SELLER',tone:'sage',sizes:'Sizes 30–40'},
  {id:'junior-strap',name:'Junior Strap School Shoe',category:'Primary school',price:16500,description:'Easy-on school footwear for younger students.',filters:['primary'],badge:'LITTLE FAVOURITE',tone:'blush',sizes:'Sizes 28–36'},
  {id:'senior-lace',name:'Senior Lace-Up School Shoe',category:'Secondary school',price:22000,description:'A structured lace-up option for older students.',filters:['secondary'],badge:'NEW',tone:'blue',sizes:'Sizes 36–44'},
  {id:'comfort-black',name:'Comfort Flex Black',category:'All-day comfort',price:19500,description:'Flexible sole feel for long school days.',filters:['primary','secondary'],badge:'ALL-DAY COMFORT',tone:'sand',sizes:'Sizes 30–42'},
  {id:'everyday-canvas',name:'Everyday Canvas Trainer',category:'Casual school days',price:18000,description:'A practical casual trainer for activity-heavy days.',filters:['casual'],badge:'MADE TO MOVE',tone:'lilac',sizes:'Sizes 30–42'},
  {id:'formal-black',name:'Formal Leather School Shoe',category:'Premium uniform',price:28000,description:'A more formal silhouette for assemblies and special days.',filters:['secondary'],badge:'A LITTLE EXTRA',tone:'olive',sizes:'Sizes 35–44'}
];

const state = {cart: JSON.parse(localStorage.getItem('samydroka_cart') || '[]'), user:null, accessToken:null, supabase:null, category:'all', search:''};
const money = n => new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);
const $ = id => document.getElementById(id);

function renderProducts(){
  const query = state.search.trim().toLowerCase();
  const visibleProducts = PRODUCTS.filter(product => {
    const matchesCategory = state.category === 'all' || product.filters.includes(state.category);
    const matchesSearch = !query || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  $('productCount').textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? 'style' : 'styles'}${visibleProducts.length !== PRODUCTS.length ? ` · ${PRODUCTS.length} total` : ''}`;
  $('productGrid').innerHTML = visibleProducts.length ? visibleProducts.map(p=>`<article class="product-card"><div class="product-image tone-${p.tone}"><span class="product-badge ${p.badge === 'NEW' ? 'badge-new' : p.badge === 'A LITTLE EXTRA' ? 'badge-premium' : ''}">${p.badge}</span><span class="product-like" aria-hidden="true">✳</span><img class="product-shoe" src="/assets/school-shoe.svg" alt="${p.name}" loading="lazy"></div><div class="product-info"><div class="product-title-row"><h3>${p.name}</h3><span class="price">${money(p.price)}</span></div><div class="product-meta">${p.category} · ${p.description}</div><div class="product-bottom"><span class="size-note">${p.sizes}</span><button class="add-btn" data-add="${p.id}">Add to bag <span aria-hidden="true">+</span></button></div></div></article>`).join('') : `<div class="no-results"><strong>No pairs found just yet.</strong><span>Try another search or browse the whole collection.</span><button type="button" id="resetFilters">Show all shoes</button></div>`;
  document.querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',()=>addToCart(btn.dataset.add)));
  const resetFilters = $('resetFilters');
  if (resetFilters) resetFilters.addEventListener('click', () => {
    state.category = 'all';
    state.search = '';
    $('productSearch').value = '';
    document.querySelectorAll('[data-filter]').forEach(button => {
      const active = button.dataset.filter === 'all';
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderProducts();
  });
}
function saveCart(){localStorage.setItem('samydroka_cart',JSON.stringify(state.cart));renderCart();}
function addToCart(id){const line=state.cart.find(x=>x.id===id);if(line)line.qty++;else state.cart.push({id,qty:1});saveCart();openCart();}
function removeFromCart(id){state.cart=state.cart.filter(x=>x.id!==id);saveCart();}
function changeQty(id,delta){const line=state.cart.find(x=>x.id===id);if(!line)return;line.qty+=delta;if(line.qty<=0)removeFromCart(id);else saveCart();}
function cartTotal(){return state.cart.reduce((s,x)=>s+(PRODUCTS.find(p=>p.id===x.id).price*x.qty),0)}
function renderCart(){
  $('cartCount').textContent=state.cart.reduce((s,x)=>s+x.qty,0);
  $('cartTotal').textContent=money(cartTotal());
  $('cartItems').innerHTML=state.cart.length?state.cart.map(x=>{const p=PRODUCTS.find(p=>p.id===x.id);return `<div class="cart-line"><div class="cart-thumb"><img class="mini-shoe" src="/assets/school-shoe.svg" alt=""></div><div><strong class="cart-product-name">${p.name}</strong><small class="cart-price">${money(p.price)}</small><div class="qty"><button data-minus="${p.id}" aria-label="Decrease ${p.name} quantity">−</button><span>${x.qty}</span><button data-plus="${p.id}" aria-label="Increase ${p.name} quantity">+</button></div></div><button class="remove-btn" data-remove="${p.id}" aria-label="Remove ${p.name}">×</button></div>`}).join(''):`<div class="cart-empty"><strong>Your bag is taking a little break.</strong><span>Add a pair to get started.</span></div>`;
  document.querySelectorAll('[data-minus]').forEach(b=>b.onclick=()=>changeQty(b.dataset.minus,-1));
  document.querySelectorAll('[data-plus]').forEach(b=>b.onclick=()=>changeQty(b.dataset.plus,1));
  document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>removeFromCart(b.dataset.remove));
}
function openCart(){$('cartDrawer').classList.add('open');$('cartDrawer').setAttribute('aria-hidden','false');$('overlay').classList.add('open')}
function closeCart(){$('cartDrawer').classList.remove('open');$('cartDrawer').setAttribute('aria-hidden','true');$('overlay').classList.remove('open');$('cartBtn').focus()}
function openAuth(){ $('authModal').showModal(); }
async function initAuth(){
  const cfg=window.SAMYDROKA_CONFIG||{};
  if(!cfg.supabaseUrl||!cfg.supabaseAnonKey){$('authMessage').textContent='Supabase is not configured yet. Add the project URL and anon key in /js/config.js.';return;}
  state.supabase=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
  const {data}=await state.supabase.auth.getSession();state.accessToken=data.session?.access_token||null;state.user=data.session?.user||null;updateAuthUI();
  state.supabase.auth.onAuthStateChange((_event,session)=>{state.accessToken=session?.access_token||null;state.user=session?.user||null;updateAuthUI();if(state.user)loadOrders();});
}
function updateAuthUI(){ $('authBtn').textContent=state.user?`Hi, ${state.user.user_metadata?.full_name?.split(' ')[0]||'there'}`:'Sign in';$('orderStatus').textContent=state.user?`Signed in as ${state.user.email}`:'Sign in to view saved orders.';if(state.user)loadOrders(); }
async function signIn(){if(!state.supabase){$('authMessage').textContent='Configure Supabase first.';return}$('authMessage').textContent='Opening Google sign-in…';const {error}=await state.supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});if(error)$('authMessage').textContent=error.message;}
async function signOut(){if(state.supabase)await state.supabase.auth.signOut();}
async function loadOrders(){if(!state.user||!state.supabase){$('ordersList').innerHTML='<div class="empty-state"><strong>Your orders will appear here.</strong><span>Sign in to see saved orders.</span></div>';return}const {data,error}=await state.supabase.from('orders').select('id,created_at,status,total,items').order('created_at',{ascending:false});if(error){$('ordersList').innerHTML=`<div class="empty-state"><strong>Orders are unavailable.</strong><span>${error.message}</span></div>`;return}if(!data.length){$('ordersList').innerHTML='<div class="empty-state"><strong>No orders yet.</strong><span>Place your first order from the shop above.</span></div>';return}$('ordersList').classList.remove('empty-state');$('ordersList').innerHTML=data.map(o=>`<article class="order-card"><div><strong>Order #${o.id.slice(0,8).toUpperCase()}</strong><small>${new Date(o.created_at).toLocaleString('en-NG')} · ${o.status}</small><small>${(o.items||[]).map(i=>`${i.name} × ${i.qty}`).join(' · ')}</small></div><div class="order-total">${money(o.total)}</div></article>`).join('')}
function openCheckout(){if(!state.cart.length){openCart();return}if(!state.user){closeCart();openAuth();$('authMessage').textContent='Sign in with Google to continue to checkout and save your order.';return}$('checkoutSummary').innerHTML=`<strong>${state.cart.reduce((s,x)=>s+x.qty,0)} item(s)</strong><br>${money(cartTotal())} total`;$('checkoutModal').showModal();}
async function placeOrder(e){e.preventDefault();$('checkoutMessage').textContent='Placing your order…';if(!state.user||!state.supabase){$('checkoutMessage').textContent='Please sign in first.';return}const items=state.cart.map(x=>{const p=PRODUCTS.find(p=>p.id===x.id);return{id:p.id,name:p.name,price:p.price,qty:x.qty}});const payload={user_id:state.user.id,customer_email:state.user.email,phone:$('phone').value.trim(),address:$('address').value.trim(),items,total:cartTotal(),status:'confirmed'};const {data,error}=await state.supabase.from('orders').insert(payload).select().single();if(error){$('checkoutMessage').textContent=error.message;return}const mail=await fetch('/api/send-confirmation',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${state.accessToken}`},body:JSON.stringify({order:data})});if (!mail.ok) {
  const detail = await mail.text();
  $('checkoutMessage').textContent =
    `Order saved, but email failed (HTTP ${mail.status}): ${detail || 'No response body returned.'}`;
  return;
}state.cart=[];saveCart();$('checkoutMessage').textContent='Order placed! Your confirmation email is on its way.';setTimeout(()=>{$('checkoutModal').close();$('checkoutForm').reset();loadOrders();closeCart();document.querySelector('#orders').scrollIntoView({behavior:'smooth'});},1000)}

document.addEventListener('DOMContentLoaded',()=>{renderProducts();renderCart();initAuth();$('cartBtn').onclick=openCart;$('closeCart').onclick=closeCart;$('overlay').onclick=closeCart;$('authBtn').onclick=()=>state.user?signOut():openAuth();$('googleSignIn').onclick=signIn;$('closeAuth').onclick=()=>$('authModal').close();$('checkoutBtn').onclick=openCheckout;$('closeCheckout').onclick=()=>$('checkoutModal').close();$('checkoutForm').onsubmit=placeOrder;document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{state.category=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(filter=>{const active=filter===button;filter.classList.toggle('active',active);filter.setAttribute('aria-pressed',String(active));});renderProducts();}));$('productSearch').addEventListener('input',event=>{state.search=event.target.value;renderProducts();});});
