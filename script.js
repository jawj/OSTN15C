// Generated by CoffeeScript 1.10.0
var CommandHistory, OSTN02C, codeMap, commandHistory, completions, inForm, inText, outNode, parseNode, printHTML, stdoutCallback, stdoutStr;

if (window.scrollTo == null) {
  window.scrollTo = window.scroll;
}

outNode = document.getElementById('output');

parseNode = document.createElement('div');

inText = document.getElementById('input');

inForm = document.getElementById('inputForm');

printHTML = function(html) {
  var child;
  parseNode.innerHTML = html;
  while ((child = parseNode.firstChild)) {
    outNode.appendChild(parseNode.removeChild(child));
  }
  return setTimeout((function() {
    return window.scrollTo(0, 10e8);
  }), 0);
};

codeMap = {
  '1': 'bold',
  '7': 'inverse',
  '4': 'uline'
};

stdoutStr = '';

stdoutCallback = function(chr) {
  var html, openCodes;
  if (chr !== null) {
    stdoutStr += String.fromCharCode(chr);
  }
  if (chr === 10 || chr === null) {
    openCodes = 0;
    html = stdoutStr.replace(/\x1b\[(1|22|7|27|4|24)m/g, function(_, match) {
      var cls;
      cls = codeMap[match];
      if (cls) {
        openCodes++;
        return "<span class='" + cls + "'>";
      } else {
        openCodes--;
        return "</span>";
      }
    });
    if (openCodes === 0) {
      printHTML(html);
      return stdoutStr = '';
    }
  }
};

OSTN02C = OSTN02CFactory(null, stdoutCallback, null);

CommandHistory = (function() {
  function CommandHistory() {
    var pastHistory;
    pastHistory = localStorage.getItem('cmdhistory');
    this.history = pastHistory ? JSON.parse(pastHistory) : [
      {
        edited: ''
      }
    ];
    this.index = this.history.length - 1;
  }

  CommandHistory.prototype.commandChanged = function(command) {
    return this.history[this.index].edited = command;
  };

  CommandHistory.prototype.commandEntered = function(command) {
    var ref;
    this.history[this.index].edited = this.history[this.index].entered;
    this.history[this.history.length - 1].entered = this.history[this.history.length - 1].edited = command;
    if (command.length > 0 && command !== ((ref = this.history[this.history.length - 2]) != null ? ref.entered : void 0)) {
      this.history.push({
        edited: ''
      });
      while (this.history.length > 100) {
        this.history.shift();
      }
    } else {
      this.history[this.history.length - 1].edited = '';
    }
    this.index = this.history.length - 1;
    localStorage.setItem('cmdhistory', JSON.stringify(this.history));
    return this.history[this.index].edited;
  };

  CommandHistory.prototype.commandNavigated = function(delta) {
    this.index += delta;
    if (this.index < 0) {
      this.index = 0;
    }
    if (this.index > this.history.length - 1) {
      this.index = this.history.length - 1;
    }
    return this.history[this.index].edited;
  };

  return CommandHistory;

})();

commandHistory = new CommandHistory();

inForm.addEventListener('submit', function(e) {
  var args, command, exe;
  e.preventDefault();
  command = inText.value;
  printHTML("> " + command + "\n");
  inText.value = commandHistory.commandEntered(command);
  args = command.match(/[\S+]+/g);
  if (args != null) {
    exe = args.shift();
    if (exe === 'clear') {
      return outNode.innerHTML = '';
    } else if (exe === 'ostn02c') {
      return OSTN02C.callMain(args);
    } else {
      return printHTML(exe + ": command not found\n\n");
    }
  }
});

completions = ['ostn02c help', 'ostn02c test', 'ostn02c list-geoids', 'ostn02c gps-to-grid ', 'ostn02c grid-to-gps ', 'clear'];

inText.addEventListener('keydown', function(e) {
  var charPos, common, completion, firstMatch, i, j, k, kc, l, len, matches, ref, ref1, same;
  kc = e.keyCode;
  if (kc === 9) {
    e.preventDefault();
    matches = [];
    for (j = 0, len = completions.length; j < len; j++) {
      completion = completions[j];
      if (completion.substring(0, inText.value.length) === inText.value) {
        matches.push(completion);
      }
    }
    if (matches.length === 1) {
      return inText.value = matches[0];
    } else if (matches.length > 1) {
      common = '';
      firstMatch = matches[0];
      for (charPos = k = 0, ref = firstMatch.length; 0 <= ref ? k < ref : k > ref; charPos = 0 <= ref ? ++k : --k) {
        for (i = l = 1, ref1 = matches.length; 1 <= ref1 ? l < ref1 : l > ref1; i = 1 <= ref1 ? ++l : --l) {
          same = firstMatch.charAt(charPos) === matches[i].charAt(charPos);
          if (!same) {
            break;
          }
        }
        if (!same) {
          break;
        }
        common += firstMatch.charAt(charPos);
      }
      if (inText.value === common) {
        return printHTML(matches.join('     ') + '\n\n');
      } else {
        return inText.value = common;
      }
    }
  } else if (kc === 38 || kc === 40) {
    e.preventDefault();
    return e.target.value = commandHistory.commandNavigated((kc === 38 ? -1 : +1));
  }
});

inText.addEventListener('input', function(e) {
  return commandHistory.commandChanged(e.target.value);
});

window.addEventListener('load', function() {
  inText.focus();
  printHTML('Type <span class="bold">ostn02c help</span> below to get started.\n');
  return printHTML('This fake shell supports [Tab] completion, [Up] + [Down] command history, and two commands (<span class="bold">ostn02c</span> and <span class="bold">clear</span>).\n\n');
});

//# sourceMappingURL=script.js.map
