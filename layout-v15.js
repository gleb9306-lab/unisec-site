/* Add a quiet full-width band before each substantive section; no repeated marketing copy. */
(() => {
 const main=document.querySelector('main'); if(!main)return;
 [...main.children].filter(node=>node.tagName==='SECTION').forEach(section=>{
   if(section.matches('.hero,.trust-bar,.numbers'))return;
   if(section.previousElementSibling?.classList.contains('section-divider-v15'))return;
   const divider=document.createElement('div');
   divider.className='section-divider-v15';divider.setAttribute('aria-hidden','true');
   divider.append(document.createElement('i'));section.before(divider);
 });
})();
