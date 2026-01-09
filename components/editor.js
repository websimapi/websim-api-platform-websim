import { Runtime } from '../lib/runtime.js';

export function createEditor(initialCode, onChange) {
  const container = document.createElement('div');
  container.className = 'editor-container';

  const textarea = document.createElement('textarea');
  textarea.className = 'editor-textarea';
  textarea.value = initialCode;
  textarea.spellcheck = false;

  const pre = document.createElement('pre');
  pre.className = 'editor-pre';
  
  const code = document.createElement('code');
  pre.appendChild(code);

  const update = () => {
    const val = textarea.value;
    code.innerHTML = Runtime.highlight(val);
    if (onChange) onChange(val);
  };

  textarea.addEventListener('input', update);
  textarea.addEventListener('scroll', () => {
    pre.scrollTop = textarea.scrollTop;
    pre.scrollLeft = textarea.scrollLeft;
  });

  // Handle Tab key
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 2;
      update();
    }
  });

  container.appendChild(pre);
  container.appendChild(textarea);
  
  update(); // Initial render

  return { element: container, getValue: () => textarea.value };
}

import { Runtime } from '../lib/runtime.js';

export function createEditor(initialCode, onChange) {
  const container = document.createElement('div');
  container.className = 'editor-container';

  const textarea = document.createElement('textarea');
  textarea.className = 'editor-textarea';
  textarea.value = initialCode;
  textarea.spellcheck = false;

  const pre = document.createElement('pre');
  pre.className = 'editor-pre';
  
  const code = document.createElement('code');
  pre.appendChild(code);

  const update = () => {
    const val = textarea.value;
    code.innerHTML = Runtime.highlight(val);
    if (onChange) onChange(val);
  };

  textarea.addEventListener('input', update);
  textarea.addEventListener('scroll', () => {
    pre.scrollTop = textarea.scrollTop;
    pre.scrollLeft = textarea.scrollLeft;
  });

  // Handle Tab key
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 2;
      update();
    }
  });

  container.appendChild(pre);
  container.appendChild(textarea);
  
  // Initial render
  update();

  return { element: container, getValue: () => textarea.value };
}