// State Management
let expression = '';
let currentInput = '0';
let lastResult = null;
let isDegree = true;
let memoryValue = 0;
let resetOnNextInput = false;

// DOM Element References
const mainDisplay = document.getElementById('main-display');
const subDisplay = document.getElementById('sub-display');
const angleToggleBtn = document.getElementById('angle-toggle');
const memoryIndicator = document.getElementById('memory-indicator');

// Event Listeners
angleToggleBtn.addEventListener('click', toggleAngleUnit);

// Toggle DEG/RAD Mode
function toggleAngleUnit() {
  isDegree = !isDegree;
  angleToggleBtn.textContent = isDegree ? 'DEG' : 'RAD';
}

// Display Functions
function updateDisplay() {
  mainDisplay.textContent = currentInput || '0';
  subDisplay.textContent = expression || '0';
}

// Clear All (AC)
function clearAll() {
  expression = '';
  currentInput = '0';
  lastResult = null;
  resetOnNextInput = false;
  updateDisplay();
}

// Delete Last Character (DEL)
function deleteLast() {
  if (resetOnNextInput) {
    clearAll();
    return;
  }
  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = '0';
  }
  updateDisplay();
}

// Input Handlers
function appendNumber(num) {
  if (resetOnNextInput) {
    currentInput = num;
    expression = '';
    resetOnNextInput = false;
  } else {
    if (currentInput === '0' || currentInput === 'Error') {
      currentInput = num;
    } else {
      currentInput += num;
    }
  }
  updateDisplay();
}

function appendDot() {
  if (resetOnNextInput) {
    currentInput = '0.';
    expression = '';
    resetOnNextInput = false;
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

function appendOperator(op) {
  if (resetOnNextInput) {
    resetOnNextInput = false;
  }
  expression += currentInput + ' ' + op + ' ';
  currentInput = '0';
  updateDisplay();
}

function appendFunction(funcName) {
  if (resetOnNextInput) {
    expression = '';
    resetOnNextInput = false;
  }
  expression += funcName + '(' + (currentInput !== '0' ? currentInput : '');
  currentInput = '0';
  updateDisplay();
}

function appendConstant(constName) {
  if (resetOnNextInput) {
    expression = '';
    resetOnNextInput = false;
  }
  currentInput = constName === 'π' ? Math.PI.toString() : Math.E.toString();
  updateDisplay();
}

function appendParen(paren) {
  if (paren === '(') {
    if (currentInput !== '0') {
      expression += currentInput + ' * (';
    } else {
      expression += '(';
    }
    currentInput = '0';
  } else {
    expression += currentInput + ')';
    currentInput = '0';
  }
  updateDisplay();
}

function appendPower() {
  expression += currentInput + ' ^ ';
  currentInput = '0';
  updateDisplay();
}

function appendFact() {
  currentInput += '!';
  updateDisplay();
}

function appendPercent() {
  let val = parseFloat(currentInput);
  if (!isNaN(val)) {
    currentInput = (val / 100).toString();
    updateDisplay();
  }
}

function toggleSign() {
  if (currentInput !== '0' && currentInput !== 'Error') {
    if (currentInput.startsWith('-')) {
      currentInput = currentInput.slice(1);
    } else {
      currentInput = '-' + currentInput;
    }
    updateDisplay();
  }
}

// Memory Operations
function handleMemory(action) {
  let val = parseFloat(currentInput);
  if (isNaN(val)) val = 0;

  switch (action) {
    case 'MC':
      memoryValue = 0;
      break;
    case 'MR':
      currentInput = memoryValue.toString();
      resetOnNextInput = false;
      break;
    case 'M+':
      memoryValue += val;
      break;
    case 'M-':
      memoryValue -= val;
      break;
  }

  // Update Memory Indicator Visibility
  if (memoryValue !== 0) {
    memoryIndicator.classList.remove('text-amber-500/0');
    memoryIndicator.classList.add('text-amber-500');
  } else {
    memoryIndicator.classList.remove('text-amber-500');
    memoryIndicator.classList.add('text-amber-500/0');
  }
  updateDisplay();
}

// Factorial Helper
function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// Evaluate Mathematical Expressions
function calculateResult() {
  let fullExpr = expression + currentInput;
  if (!fullExpr) return;

  try {
    let sanitized = fullExpr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace/−/g, '-')
      .replace(/\^/g, '**');

    // Handle Factorials (e.g., 5!)
    sanitized = sanitized.replace(/(\d+)!/g, (match, p1) => {
      return factorial(parseInt(p1));
    });

    // Handle Trigonometric & Math Functions
    sanitized = sanitized.replace(/sin\(([^)]+)\)/g, (m, arg) => {
      let val = eval(arg);
      return Math.sin(isDegree ? (val * Math.PI) / 180 : val);
    });
    sanitized = sanitized.replace(/cos\(([^)]+)\)/g, (m, arg) => {
      let val = eval(arg);
      return Math.cos(isDegree ? (val * Math.PI) / 180 : val);
    });
    sanitized = sanitized.replace(/tan\(([^)]+)\)/g, (m, arg) => {
      let val = eval(arg);
      return Math.tan(isDegree ? (val * Math.PI) / 180 : val);
    });

    sanitized = sanitized.replace(/asin\(([^)]+)\)/g, (m, arg) => {
      let val = Math.asin(eval(arg));
      return isDegree ? (val * 180) / Math.PI : val;
    });
    sanitized = sanitized.replace(/acos\(([^)]+)\)/g, (m, arg) => {
      let val = Math.acos(eval(arg));
      return isDegree ? (val * 180) / Math.PI : val;
    });
    sanitized = sanitized.replace(/atan\(([^)]+)\)/g, (m, arg) => {
      let val = Math.atan(eval(arg));
      return isDegree ? (val * 180) / Math.PI : val;
    });

    sanitized = sanitized.replace(/log\(/g, 'Math.log10(');
    sanitized = sanitized.replace(/ln\(/g, 'Math.log(');
    sanitized = sanitized.replace(/sqrt\(/g, 'Math.sqrt(');
    sanitized = sanitized.replace(/cbrt\(/g, 'Math.cbrt(');

    let result = eval(sanitized);

    // Format Result Precision
    if (typeof result === 'number') {
      if (!isFinite(result)) {
        currentInput = 'Error';
      } else {
        currentInput = parseFloat(result.toFixed(10)).toString();
      }
    } else {
      currentInput = 'Error';
    }

    expression = fullExpr + ' =';
    resetOnNextInput = true;
  } catch (e) {
    currentInput = 'Error';
    resetOnNextInput = true;
  }

  updateDisplay();
}

// Physical Keyboard Shortcuts Support
document.addEventListener('keydown', (e) => {
  if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
    if (e.key === '.') appendDot();
    else appendNumber(e.key);
  } else if (['+', '-', '*', '/'].includes(e.key)) {
    appendOperator(e.key);
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    calculateResult();
  } else if (e.key === 'Backspace') {
    deleteLast();
  } else if (e.key === 'Escape') {
    clearAll();
  } else if (e.key === '(' || e.key === ')') {
    appendParen(e.key);
  }
});