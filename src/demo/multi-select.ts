
type ElementTag<T extends keyof HTMLElementTagNameMap> = Partial<Omit<HTMLElementTagNameMap[T], 'style' | 'className'>>;
type ElementAttributes<T extends keyof HTMLElementTagNameMap> = {
  [Property in keyof ElementTag<T>]: ElementTag<T>[Property]
} & {
  className?: string | string[]
  style?: Partial<CSSStyleDeclaration>
  text?: string
  optEl?: HTMLOptionElement
  srcOption?: HTMLOptionElement
}

function isWritable<T extends Object>(obj: T, key: keyof T): boolean {
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  return !!(desc?.writable ?? true);
}

function newEl<T extends keyof HTMLElementTagNameMap>(tag: T, attrs: ElementAttributes<T>) {
  let e = document.createElement(tag);
  if (attrs === undefined) return e;

  let attrKeys = Object.keys(attrs) as (keyof ElementAttributes<T>)[];
  for (let k of attrKeys) {
    if (k === 'className') {
      let cls = attrs[k]
      if (Array.isArray(cls)) {
        for (let o of cls) {
          if (!o) continue;
          e.classList.add(o);
        }
      }
      else if (!!cls) {
        // @ts-ignore
        e.classList.add(cls!);
      }
    }
    else if (k === 'style') {
      let cssStyles = attrs[k]!;
      let styleKeys = Object.keys(cssStyles);
      for (let ks of styleKeys) {
        if (ks === 'length' || ks === 'parentRule')
          continue;
        e.style[ks] = cssStyles[ks];
      }
    }
    else if (k === 'text') {
      if (!attrs[k]) e.innerHTML = '&nbsp;';
      else {
        // @ts-ignore
        e.innerText = attrs[k]!;
      }
    }
    else if (k === 'type' || k === 'checked' || k === 'srcOption' || k === 'optEl' || isWritable(e, k)) {
      // @ts-ignore
      e[k] = attrs[k];
    }
    else {
      // @ts-ignore
      console.warn(`Property not set "${k}":`, isWritable(e, k));
    }
  }
  return e;
}

interface Config {
  search: boolean
  height: string
  placeholder: string
  txtSelected: string
  txtAll: string
  txtRemove: string
  txtSearch: string
  style?: {
    width?: string
    padding?: string
  },
  searchInput?: {
    className?: string
  }
}

const DEFAULT_CONFIG: Config = {
  search: true,
  height: '15rem',
  placeholder: 'Select...',
  txtSelected: 'Selected',
  txtAll: 'All',
  txtRemove: 'Remove',
  txtSearch: 'Search...',
};

export function createMultiSelect(el: HTMLSelectElement, options: Partial<Config> = {}) {
  const config: Config = {
    ...DEFAULT_CONFIG,
    ...options,
  };

  // 

  let div = newEl('div', {
    className: 'multiselect-dropdown',
    style: {
      padding: config.style?.padding ?? ''
    }
  });

  // opt wrapper - 10px, list - 4px
  let defaultWidth = `calc(0.35rem + 1rem + 34px + + ${el.clientWidth}px)`;
  div.style.setProperty('min-width', config.style?.width ?? defaultWidth);

  el.style.visibility = 'hidden';
  el.style.position = 'absolute';
  el.parentNode?.insertBefore(div, el.nextSibling);

  let listWrap = newEl('div', { className: 'multiselect-dropdown-list-wrapper' });
  let list = newEl('div', { className: 'multiselect-dropdown-list', style: { maxHeight: config.height }});
  let search = newEl('input', {
    className: ['multiselect-dropdown-search'].concat([config.searchInput?.className ?? 'form-control']),
    style: {
      display: config.search ? 'block' : 'none'
    },
    placeholder: config.txtSearch
  });

  listWrap.appendChild(search);
  div.appendChild(listWrap);
  listWrap.appendChild(list);

  // @ts-ignore
  el.loadOptions = () => {
    list.innerHTML='';
    
    if (el.attributes['multiselect-select-all']?.value=='true') {
      var op = newEl('div', { className:'multiselect-dropdown-all-selector' });
      var ic = newEl('input', { type:'checkbox' });
      op.appendChild(ic);
      op.appendChild(newEl('label',{text:config.txtAll}));

      op.addEventListener('click', () => {
        op.classList.toggle('checked');
        op.querySelector("input")!.checked = !op.querySelector("input")!.checked;
        
        var ch = op.querySelector("input")!.checked;
        list.querySelectorAll(":scope > div:not(.multiselect-dropdown-all-selector)")
          .forEach((i) => {
            // @ts-ignore
            if (i.style.display!=='none') {
              i.querySelector("input")!.checked = ch;
              // @ts-ignore
              i.optEl.selected = ch
            }
          });

        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      ic.addEventListener('click',(ev)=>{
        ic.checked = !ic.checked;
      });

      list.appendChild(op);
    }

    Array.from(el.options).map(o => {
      var op = newEl('div', { className: o.selected ? 'checked' : '', optEl: o })
      var ic = newEl('input', { type: 'checkbox', checked: o.selected });
      op.appendChild(ic);
      op.appendChild(newEl('label', { text:o.text }));

      op.addEventListener('click', () => {
        op.classList.toggle('checked');
        op.querySelector("input")!.checked = !op.querySelector("input")!.checked;
        // @ts-ignore
        op.optEl.selected = !op.optEl.selected;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      ic.addEventListener('click',(ev)=>{
        ic.checked=!ic.checked;
      });
      // @ts-ignore
      o.listitemEl = op;
      list.appendChild(op);
    });


    // @ts-ignore
    div.refresh = () => {
      div.querySelectorAll('span.optext, span.placeholder').forEach(t=>div.removeChild(t));
      var sels=Array.from(el.selectedOptions);
      if(sels.length>(el.attributes['multiselect-max-items']?.value??5)){
        div.appendChild(newEl('span', {
          className: ['optext', 'maxselected'],
          text: sels.length + ' ' + config.txtSelected
        }));          
      }
      else{
        sels.map(x=>{
          var c = newEl('span', { className: 'optext', text: x.text, srcOption: x });
          if((el.attributes['multiselect-hide-x']?.value !== 'true'))
            c.appendChild(newEl('span', { className: 'optdel', text:'🗙', title: config.txtRemove, onclick: (ev)=>{
              // @ts-ignore
              c.srcOption.listitemEl.dispatchEvent(new Event('click'));
              // @ts-ignore
              div.refresh();
              ev.stopPropagation();
            }}));

          div.appendChild(c);
        });
      }
      if (0 == el.selectedOptions.length) {
        div.appendChild(newEl('span', {
          className: 'placeholder',
          text: el.attributes['placeholder']?.value ?? config.placeholder
        }));
      }
    };
    
    // @ts-ignore
    div.refresh();
  }

  // @ts-ignore
  el.multiselectdiv = div;

  // @ts-ignore
  el.loadOptions();

  let observer = new MutationObserver(() => {
    // @ts-ignore
    el.loadOptions();

    // opt wrapper - 10px, list - 4px
    let defaultWidth = `calc(0.35rem + 1rem + 34px + ${el.clientWidth}px)`;
    div.style.setProperty('min-width', config.style?.width ?? defaultWidth);
  });

  // @ts-ignore
  el.destory_multiselect = () => {
    observer.disconnect();
  }

  observer.observe(el, {
    childList: true,
    subtree: true,
  })

  search.addEventListener('input', () => {
    list.querySelectorAll(":scope div:not(.multiselect-dropdown-all-selector)").forEach(d => {
      var txt = d.querySelector("label")!.innerText.toUpperCase();
      // @ts-ignore
      d.style.display = txt.includes(search.value.toUpperCase()) ? 'block' : 'none';
    });
  });

  div.addEventListener('click', () => {
    let r = div.getBoundingClientRect();
    listWrap.style.display = 'block';
    listWrap.style.left = r.left.toString() + 'px';
    listWrap.style.top = r.top.toString() + 'px';
    listWrap.style.width = r.width.toString() + 'px';
    search.focus();
    search.select();
  });
  
  document.addEventListener('click', function(event) {
    if (!div.contains(event.target as any) && listWrap.style.display != 'none') {
      listWrap.style.display='none';
      // @ts-ignore
      div.refresh();
    }
  });
}