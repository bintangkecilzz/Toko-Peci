/* ===== Data Produk (sesuaikan stok per-ukuran di sini) =====
       Struktur:
       {
         id: number,
         name: string,
         price: number,
         img: string,
         stock: { "52": number, "54": number, ... }
       }
    */
    const PRODUCTS = [
      { id:1, name:'Peci Hitam Polos', price:25000, img:'pic/hitam.png', stock: {"5":10,"6":8,"7":6,"8":4,"9":2,"10":1} },
      { id:2, name:'Peci Bordir Emas', price:55000, img:'pic/songkok.png', stock: {"5":5,"6":4,"7":3,"8":2,"9":1,"10":0} },
      { id:3, name:'Peci Songkok Katun', price:32000, img:'pic/kopeah.png', stock: {"5":12,"6":10,"7":9,"8":5,"9":3,"10":2} },
      { id:4, name:'Peci Haji', price:27000, img:'pic/jiwa.png', stock: {"5":6,"6":6,"7":5,"8":4,"9":2,"10":1} },
      { id:5, name:'Peci Anak Motif', price:25000, img:'pic/haji.png', stock: {"5":8,"6":7,"7":6,"8":5,"9":3,"10":2} },
      { id:6, name:'Peci Khas Lampung', price:40000, img:'pic/lampung.png', stock: {"5":3,"6":3,"7":2,"8":2,"9":1,"10":0} },
      { id:7, name:'Peci Khas Aceh', price:45000, img:'pic/aceh.png.jpg', stock: {"5":4,"6":4,"7":3,"8":2,"9":1,"10":1} },
      { id:8, name:'Peci BHS', price:150000, img:'pic/bhs.jpg', stock: {"5":2,"6":2,"7":1,"8":1,"9":0,"10":0} },
      { id:9, name:'Peci Rajut', price:20000, img:'pic/RAJUT.jpeg', stock: {"5":15,"6":12,"7":10,"8":8,"9":6,"10":5} },
      { id:10, name:'Peci Rajut', price:20000, img:'pic/merah.jpeg', stock: {"5":15,"6":12,"7":10,"8":8,"9":6,"10":5} },
      { id:11, name:'Peci Rajut', price:20000, img:'pic/biru.jpeg', stock: {"5":15,"6":12,"7":10,"8":8,"9":6,"10":5} },
      { id:12, name:'Peci Rajut', price:20000, img:'pic/item.jpeg', stock: {"5":15,"6":12,"7":10,"8":8,"9":6,"10":5} },
    ];

    // App state
    let cart = []; // { productId, size, qty }
    let visibleProducts = [...PRODUCTS];

    // Utility
    const money = v => v.toLocaleString('id-ID');

    // Render products
    function renderProducts(list = visibleProducts) {
      const wrap = document.getElementById('products');
      wrap.innerHTML = '';
      list.forEach(p => {
        const card = document.createElement('article');
        card.className = 'product';
        // create size options markup
        let sizeOptions = '';
        Object.keys(p.stock).forEach(sz => {
          const s = p.stock[sz];
          sizeOptions += `<option value="${sz}" ${s<=0 ? 'data-out="1"':''}>${sz} ${s<=0 ? '(Habis)':''}</option>`;
        });
        card.innerHTML = `
          <div class="thumb"><img src="${p.img}" alt="${p.name}"></div>
          <div>
            <div class="p-title">${p.name}</div>
            <div class="p-desc">Kualitas bahan terbaik • Jahitan rapi</div>
            <div class="p-row" style="margin-top:10px">
              <div class="price">Rp ${money(p.price)}</div>
              <div class="stock small">Stok total: <strong>${Object.values(p.stock).reduce((a,b)=>a+b,0)}</strong></div>
            </div>
            <div class="controls" style="margin-top:10px">
              <label style="font-size:0.85rem;color:var(--muted)">Pilih ukuran</label>
              <select class="size-select" onchange="onSizeChange(this, ${p.id})">
                ${sizeOptions}
              </select>
              <div style="display:flex;gap:8px;margin-top:8px;align-items:center">
                <input type="number" class="qty-input" value="1" min="1" style="width:84px" />
                <div class="add" style="flex:1;display:flex;gap:8px">
                  <button class="btn btn-primary" onclick="addToCart(this, ${p.id})">Tambah ke Keranjang</button>
                </div>
              </div>
            </div>
          </div>
        `;
        wrap.appendChild(card);
        // disable sizes with 0 stock
        const sel = card.querySelector('.size-select');
        for (let opt of sel.options) {
          if (opt.getAttribute('data-out')) opt.disabled = true;
        }
      });
    }

    function onSizeChange(selectEl, productId){
      // If selected size is out (disabled), choose next available
      if(selectEl.options[selectEl.selectedIndex].disabled){
        // find first enabled
        for (let opt of selectEl.options) {
          if (!opt.disabled) { selectEl.value = opt.value; break; }
        }
      }
    }

    // Filtering
    function filterProducts(){
      const q = document.getElementById('search').value.trim().toLowerCase();
      const size = document.getElementById('filterSize').value;
      visibleProducts = PRODUCTS.filter(p => {
        const matchesQ = !q || p.name.toLowerCase().includes(q);
        const matchesSize = !size || (p.stock[size] && p.stock[size] > 0);
        return matchesQ && matchesSize;
      });
      renderProducts(visibleProducts);
    }

    // Cart functions
    function findCartIndex(productId, size){
      return cart.findIndex(ci => ci.productId === productId && ci.size === size);
    }

    function addToCart(btn, productId){
      const card = btn.closest('.product');
      const sel = card.querySelector('.size-select');
      const size = sel.value;
      const qtyInput = card.querySelector('.qty-input');
      let qty = parseInt(qtyInput.value) || 1;
      if (qty < 1) qty = 1;

      const product = PRODUCTS.find(p => p.id === productId);
      const available = product.stock[size] || 0;

      if (available <= 0) { alert('Ukuran ini habis stoknya.'); return; }
      if (qty > available) { alert('Stok tidak cukup. Tersedia: ' + available); return; }

      // decrement stock
      product.stock[size] -= qty;

      // add to cart or increase qty
      const idx = findCartIndex(productId, size);
      if (idx >= 0) {
        cart[idx].qty += qty;
      } else {
        cart.push({ productId, size, qty });
      }

      updateCartUI();
      renderProducts(visibleProducts); // refresh stock display
      toast(`${product.name} (Uk ${size}) x${qty} ditambahkan`);
    }

    function buyNow(productId){
      // add 1 of default selected size then open cart
      const product = PRODUCTS.find(p => p.id === productId);
      // find first available size
      const availableSize = Object.keys(product.stock).find(sz => product.stock[sz] > 0);
      if(!availableSize) { alert('Produk ini habis'); return; }
      const idx = findCartIndex(productId, availableSize);
      if (idx >= 0) cart[idx].qty += 1;
      else cart.push({ productId, size:availableSize, qty:1 });
      product.stock[availableSize] -= 1;
      updateCartUI();
      renderProducts(visibleProducts);
      toggleCart(true);
    }

    function updateCartUI(){
      const list = document.getElementById('cartList');
      list.innerHTML = '';
      let total = 0;
      cart.forEach((ci, index) => {
        const product = PRODUCTS.find(p => p.id === ci.productId);
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
          <div class="ci-thumb"><img src="${product.img}" alt="${product.name}"></div>
          <div class="ci-meta"><b>${product.name}</b><small>Uk: ${ci.size}</small></div>
          <div class="ci-right">
            <div style="font-weight:700">Rp ${money(product.price * ci.qty)}</div>
            <div style="display:flex;gap:6px;align-items:center">
              <input type="number" min="1" value="${ci.qty}" style="width:66px;padding:6px;border-radius:6px;border:1px solid #eef2f6" onchange="changeQty(${index}, this)" />
              <button class="ci-remove" onclick="removeItem(${index})">Hapus</button>
            </div>
          </div>
        `;
        list.appendChild(row);
        total += product.price * ci.qty;
      });
      document.getElementById('count').innerText = cart.reduce((s,i)=>s+i.qty,0);
      document.getElementById('totalAmount').innerText = money(total);
    }

    function changeQty(cartIndex, inputEl){
      let newQty = parseInt(inputEl.value) || 1;
      if(newQty < 1) newQty = 1;
      const item = cart[cartIndex];
      const product = PRODUCTS.find(p => p.id === item.productId);
      const currentQty = item.qty;
      // compute available stock (note: product.stock is remaining stock)
      const available = product.stock[item.size] + currentQty; // because current qty is reserved in cart
      if(newQty > available){
        alert('Stok tidak cukup. Tersedia: ' + available);
        inputEl.value = currentQty;
        return;
      }
      // adjust product stock
      product.stock[item.size] = available - newQty;
      item.qty = newQty;
      updateCartUI();
      renderProducts(visibleProducts);
    }

    function removeItem(index){
      const item = cart[index];
      const product = PRODUCTS.find(p => p.id === item.productId);
      // return qty to stock
      product.stock[item.size] += item.qty;
      cart.splice(index,1);
      updateCartUI();
      renderProducts(visibleProducts);
    }

    function clearCart(){
      // return all to stock
      cart.forEach(ci => {
        const product = PRODUCTS.find(p => p.id === ci.productId);
        product.stock[ci.size] += ci.qty;
      });
      cart = [];
      updateCartUI();
      renderProducts(visibleProducts);
    }

    function toggleCart(forceOpen){
      const panel = document.getElementById('cartPanel');
      if(forceOpen) panel.classList.add('open');
      else panel.classList.toggle('open');
    }

    // Checkout via WhatsApp
    function checkoutWA(){
      const nama = document.getElementById('nama').value.trim();
      const wa = document.getElementById('wa').value.trim();
      const alamat = document.getElementById('alamat').value.trim();
      const cat = document.getElementById('catatan').value.trim();

      if(cart.length === 0){ alert('Keranjang kosong!'); return; }
      if(!nama || !wa || !alamat){ alert('Lengkapi Nama, Nomor WA, dan Alamat.'); return; }

      // Format pesan
      let pesan = `Halo, saya ingin memesan:%0A`;
      cart.forEach(ci => {
        const p = PRODUCTS.find(x => x.id === ci.productId);
        pesan += `- ${p.name} (Uk: ${ci.size}) x${ci.qty} : Rp ${money(p.price * ci.qty)}%0A`;
      });
      const total = cart.reduce((s,i) => s + PRODUCTS.find(p=>p.id===i.productId).price * i.qty, 0);
      pesan += `%0ATotal: Rp ${money(total)}%0A%0A`;
      pesan += `Nama: ${nama}%0ANo WA: ${wa}%0AAlamat: ${alamat}`;
      if(cat) pesan += `%0A Catatan: ${encodeURIComponent(cat)}`;

      // normalize phone (08xxx -> 628xxx)
      let phone = wa.replace(/\D/g,'');
      if(phone.startsWith('0')) phone = '62' + phone.slice(1);
      if(!phone.startsWith('62')) phone = '62' + phone; // fallback

      const url = `https://wa.me/6281380908525${phone}?text=${pesan}`;
      window.open(url,'_blank');
    }

    // Small toast
    function toast(msg){
      const t = document.createElement('div');
      t.style.position='fixed';t.style.right='18px';t.style.bottom='110px';
      t.style.background='linear-gradient(90deg,#111827,#0b1220)';t.style.color='white';
      t.style.padding='10px 12px';t.style.borderRadius='10px';t.style.boxShadow='0 10px 30px rgba(2,6,23,0.2)';
      t.style.zIndex=9999;t.innerText = msg;document.body.appendChild(t);
      setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateY(6px)' }, 1600);
      setTimeout(()=>t.remove(),2200);
    }

    // Init
    document.getElementById('year').innerText = new Date().getFullYear();
    renderProducts();
    updateCartUI();

    // Expose filter function to global (already used in input)
    window.filterProducts = filterProducts;
    window.addToCart = addToCart;
    window.buyNow = buyNow;
    window.clearCart = clearCart;
    window.checkoutWA = checkoutWA;
    window.toggleCart = toggleCart;
    window.changeQty = changeQty;
    window.removeItem = removeItem;