!(function () {
  "use strict";
  class t {
      constructor(t, e) {
          (this.settings = this.settings || {}), (this.settings.options = t), (this.storableSettings = e || {}), (this.managedSettings = []);
      }
      get enabled() {
          return !0;
      }
      async updateStorableSettings(t) {
          Object.assign(this.storableSettings, t);
      }
      async getStorableSettings() {
          let t = {};
          return (
              this.managedSettings.forEach((e) => {
                  t[e] = this.storableSettings[e];
              }),
              t
          );
      }
      async checkCart(t, e) {
          throw (console.log("checkCart called with", { cart: t, productData: e }), new Error("You must implement checkCart(cart, productData)"));
      }
  }
  async function e(t, e) {
      const a = await fetch(t, { credentials: "same-origin", headers: { "X-Requested-With": "XMLHttpRequest", "Content-Type": "application/json;" }, ...e });
      if (!a.ok) throw a;
      return await a.json();
  }
  class a {
      constructor(t) {
          if (!t.render || !t.handle) throw (console.log("Options missing", t));
          (this.settings = { sections: { products: t.render }, routes: { products: "/collections/".concat(t.handle) } }), (this.fetchJSON = e.bind(this)), (this.cart = !1);
      }
      async getCart() {
          if (!(!(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0]) && this.cart) return this.cart;
          const t = await e("/cart.js");
          return (this.cart = t), t;
      }
      async updateCart(t) {
          try {
              const a = await e("/cart/update.js", { method: "POST", body: JSON.stringify(t) });
              return (this.cart = a), a;
          } catch (t) {
              return console.error("Error updating cart", t), !1;
          }
      }
      async getProduct(t) {
          try {
              return await e("/products/".concat(t, ".js"));
          } catch (t) {
              return console.error("Unable to fetch product.", t), !1;
          }
      }
      async getProducts() {
          if (!(arguments.length > 0 && void 0 !== arguments[0] && arguments[0]) && this.sourceData) return this.sourceData;
          let t = await this.getSectionsJson(this.settings.routes.products, [this.settings.sections.products]);
          if (t[this.settings.sections.products]) {
              if (((this.sourceData = t[this.settings.sections.products]), !this.sourceData.products || !this.sourceData.recycling)) throw new Error("Required Data is missing.", this.sourceData);
              return this.sourceData;
          }
          throw new Error("Unable to Parse Data");
      }
      async getSectionsJson(t, a) {
          const s = new URLSearchParams({ sections: a }),
              n = new URL(t, location.href);
          n.search = s.toString();
          const i = await e(n);
          let r = {};
          return (
              a.forEach((t) => {
                  try {
                      let s = ((e = i[t]), (a = 'script[type="application/json"]'), new DOMParser().parseFromString(e, "text/html").querySelectorAll(a));
                      null != s &&
                          s.length > 0 &&
                          ((r[t] = {}),
                          s.forEach((e) => {
                              let a = e.getAttribute("data-type") || !1;
                              a && (r[t][a] = JSON.parse(e.innerText || "{}"));
                          }, this));
                  } catch (e) {
                      console.error("Unable to parse JSON for '".concat(t, "':"), e);
                  }
                  var e, a;
              }, this),
              r
          );
      }
  }
  class s extends t {
      constructor(t, e) {
          super(t, e), (this.managedSettings = ["feeCount"]), (this.settings.context = t.context || ""), (this.checkCart = this.checkCart.bind(this));
      }
      async checkCart(t, e) {
          const a = await this.checkState(e),
              s = Object.values(e.recycling) || [];
          let n,
              i = 0,
              r = {};
          return (
              t.items.forEach((t) => {
                  e.products[t.variant_id] && (i += e.products[t.variant_id].recycle * t.quantity), t.variant_id != a && s.includes(t.variant_id) ? (r[t.variant_id] = 0) : t.variant_id == a && (n = t);
              }),
              n ? n.quantity != i && (r[n.variant_id] = i) : a && i > 0 && (r[a] = i),
              (this.storableSettings.feeCount = i),
              r
          );
      }
      async checkState(t) {
          let e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
              a = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
          if (!e || !a) {
              if (!this.storableSettings.location) return null;
              (e = this.storableSettings.location.country || !1), (a = this.storableSettings.location.province || !1);
          }
          return "US" === e && !1 !== a && (t.recycling[a.toLowerCase()] || !1);
      }
  }
  class n extends t {
      constructor(t, e) {
          super(t, e), (this.checkCart = this.checkCart.bind(this));
      }
      async checkCart(t, e) {
          var a;
          if (null === (a = e.haulaway) || void 0 === a || !a.products) return {};
          let s = 0,
              n = 0,
              i = !1,
              r = !1;
          t.items.forEach((t) => {
              var a, o;
              null !== (a = e.products[t.variant_id]) && void 0 !== a && a.haul ? (s += t.quantity) : null !== (o = e.products[t.variant_id]) && void 0 !== o && o.haul_base && (n += t.quantity),
                  t.variant_id == e.haulaway.products.mattress ? (i = t) : t.variant_id == e.haulaway.products.base && (r = t);
          }, this),
              s > n ? (n = 0) : n > 0 && s > 0 && (n -= s),
              i || (i = { variant_id: e.haulaway.products.mattress, quantity: 0 }),
              r || (r = { variant_id: e.haulaway.products.base, quantity: 0 });
          let o = { [i.variant_id]: i.quantity || 0, [r.variant_id]: r.quantity || 0 };
          if (o[i.variant_id] > s && n > 0) {
              let t = o[i.variant_id] - s;
              t > 0 && (o[r.variant_id] += t);
          } else if (o[r.variant_id] > n && s > 0) {
              let t = o[r.variant_id] - n;
              t > 0 && (o[i.variant_id] += t);
          }
          return o[i.variant_id] > s && (o[i.variant_id] = s), o[i.variant_id] > n && (o[r.variant_id] = n), o[i.variant_id] == i.quantity && delete o[i.variant_id], o[r.variant_id] == r.quantity && delete o[r.variant_id], o;
      }
  }
  class i {
      constructor(t) {
          (this.settings = { storage: "dhCart" }),
              (this.storableSettings = this.getStorableSettings()),
              t.location && (this.storableSettings.location = t.location),
              (this.RequestService = new a(t)),
              (this.handlers = [new s({ context: "cart", ...t }, this.storableSettings), new n({ ...t }, this.storableSettings)]);
      }
      addHandler(t) {
          this.handlers.push(t);
      }
      async retreiveCart() {
          let t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
          return await this.RequestService.getCart(t);
      }
      async checkCart() {
          const t = await this.RequestService.getCart(),
              e = await this.RequestService.getProducts();
          if (0 === t.item_count) return { didUpdate: !1, updates: {} };
          let a = {};
          for (const s of this.handlers) s.enabled && Object.assign(a, await s.checkCart(t, e));
          return await this.saveStorableSettings(), { didUpdate: await this.updateCart(a), updates: a };
      }
      async updateCart(t) {
        if (Object.keys(t).length) {
              const e = await this.RequestService.updateCart({ updates: t });
              return !1 !== e && e.item_count > -1;
          }
          return !1;
      }
      async collectHandlerStorableSettings() {
          for (const t of this.handlers) t.enabled && Object.assign(this.storableSettings, await t.getStorableSettings());
          return this.storableSettings;
      }
      async updateHandlerStorableSettings() {
          for (const t of this.handlers) t.enabled && (await t.updateStorableSettings(this.storableSettings));
      }
      getLocation() {
          return this.storableSettings.location || !1;
      }
      setLocation(t) {
          (this.storableSettings.location = t), this.saveStorableSettings();
      }
      getStorableSettings() {
          return this.storableSettings || (this.storableSettings = JSON.parse(localStorage.getItem(this.settings.storage)) || {}), this.storableSettings;
      }
      async saveStorableSettings() {
          await this.collectHandlerStorableSettings();
          try {
              localStorage.setItem(this.settings.storage, JSON.stringify(this.storableSettings));
          } catch (t) {
              console.error("Unable to save settings.", t);
          }
          this.updateHandlerStorableSettings();
      }
      clearStorableSettings() {
          try {
              localStorage.removeItem(this.settings.storage), (this.storableSettings = {});
          } catch (t) {
              console.error("Unable to clear settings.", t);
          }
          this.updateHandlerStorableSettings();
      }
  }
  const r = new (class extends class {
      constructor() {
          (this.settings = { selectors: {} }), (this.elements = {});
      }
      loadElements() {
          Object.entries(this.settings.selectors).forEach((t) => {
              const [e, a] = t;
              this.elements[e] || (this.elements[e] = document.querySelector(a));
          });
      }
  } {
      constructor() {
          if ((super(), void 0 === window.routes || void 0 === window.routes.data_source)) throw new Error("Unable to start Checkout.");
          (this.CartManager = new i({ ...window.routes.data_source })),
              (this.handlePageChange = this.handlePageChange.bind(this)),
              (this.handleCountryInputChange = this.handleCountryInputChange.bind(this)),
              (this.handleLocationInputChange = this.handleLocationInputChange.bind(this)),
              (this.settings.selectors = { country: '[data-address-field="country"] select', province: '[data-address-field="province"] select', button: "[data-step-footer] button" }),
              (this.updating = !1);
      }
      attachCheckout() {
          document.addEventListener("page:load", this.handlePageChange), document.addEventListener("page:change", this.handlePageChange);
      }
      detachCheckout() {
          document.removeEventListener("page:load", this.handlePageChange), document.removeEventListener("page:change", this.handlePageChange);
      }
      async handlePageChange(t) {
          if ((this.loadElements(), "contact_information" === window.Shopify.Checkout.step)) {
              if ("page:load" === t.type) {
                  let t = await this.CartManager.getLocation();
                  t && (this.elements.country.querySelector('[data-code="'.concat(t.country, '"]')).setAttribute("selected", "selected"), this.elements.province && (this.elements.province.value = t.province));
              }
              this.elements.country.addEventListener("change", this.handleCountryInputChange), this.elements.province && this.elements.province.addEventListener("change", this.handleLocationInputChange), this.handleLocationInputChange();
          } else if ("shipping_method" === window.Shopify.Checkout.step) {
              (await this.CartManager.getLocation()) && this.stageUpdate();
          } else "thank_you" === window.Shopify.Checkout.page && this.CartManager.clearCurrentSettings();
      }
      async handleCountryInputChange(t) {
          this.loadElements(), this.elements.province && this.elements.province.addEventListener("change", this.handleLocationInputChange), this.handleLocationInputChange(t);
      }
      async handleLocationInputChange() {
          const t = this.elements.country.selectedOptions[0].getAttribute("data-code"),
              e = (this.elements.province && this.elements.province.value) || "",
              a = await this.CartManager.getLocation();
          return ((!1 === a && t) || (a && (a.country != t || a.province != e))) && this.CartManager.setLocation({ country: t, province: e }), this.stageUpdate();
      }
      async stageUpdate() {
          if (this.updating) return;
          (this.updating = !0), this.toggleButtonStatus();
          const { didUpdate: t } = await this.CartManager.checkCart();
          setTimeout(() => {
              t &&
                  (window.OrderSummaryUpdater
                      ? setTimeout(() => {
                            window.OrderSummaryUpdater.prototype.refresh();
                        }, 300)
                      : window.location.reload()),
                  (this.updating = !1),
                  this.toggleButtonStatus();
          }, 300);
      }
      toggleButtonStatus() {
          (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.updating)
              ? (this.elements.button.setAttribute("disabled", "disabled"), this.elements.button.classList.add("btn--loading"))
              : (this.elements.button.removeAttribute("disabled"), this.elements.button.classList.remove("btn--loading"));
      }
  })();
  r.attachCheckout();
})();
