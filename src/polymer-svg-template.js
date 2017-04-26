window.PolymerSvgTemplate = function templateInSvg(name) {
  const ua = window.navigator.userAgent;

  // IE10-11 does not need this fix.
  if (/MSIE /.test(ua) || /Trident\//.test(ua)) {
    return;
  }

  // owner document of this import module
  const doc = window.currentImport;
  const ns = doc.body.namespaceURI;

  const template = Polymer.DomModule.import(name, 'template');
  if (template) {
    walkTemplate(template._content || template.content);
  }

  function upgradeTemplate(el) {
    const tmpl = el.ownerDocument.createElement('template');
    el.parentNode.insertBefore(tmpl, el);
    const attribs = el.attributes;
    let count = attribs.length;
    let child;
    while (count-- > 0) {
      const attrib = attribs[count];
      tmpl.setAttribute(attrib.name, attrib.value);
      el.removeAttribute(attrib.name);
    }
    el.parentNode.removeChild(el);
    const content = tmpl.content;
    while ((
      child = el.firstChild
    )) {
      content.appendChild(child);
    }
    return tmpl;
  }

  function walkTemplate(root) {
    const treeWalker = doc.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      {acceptNode: function(node) { return NodeFilter.FILTER_ACCEPT; }},
      false
    );
    let nodeList = [], node;
    while (treeWalker.nextNode()) {
      node = treeWalker.currentNode;
      if (node.localName === 'svg') {
        walkTemplate(node);
      } else if (node.localName === 'template' && !node.hasAttribute('preserve-content') &&
        node.namespaceURI !== ns) {
          node = upgradeTemplate(node);
          walkTemplate(node._content || node.content);
          treeWalker.currentNode = node;
        }
    }
  }
};
