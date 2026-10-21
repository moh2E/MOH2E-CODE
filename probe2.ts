import { parseSource, autoFixSource } from "./src/engine";
const src = 'ALGORITHME Note\nVARIABLES\n    n : ENTIER\nDEBUT\n    n <- 12\n    SI n >= 10\n        ECRIRE("Admis")\n    SINON\n        ECRIRE("Reprende")\nFIN\n';
const { diagnostics } = parseSource(src);
for (const d of diagnostics) console.log(d.code, "line", d.line, JSON.stringify(d.data), (d.fixes||[]).map(f=>`${f.id}|${f.safe}|${f.label.fr}|${f.explanation.fr.slice(0,70)}`));
const a = autoFixSource(src);
console.log("== applied:", a.applied.map(n=>n.label.fr), "remaining", a.remaining);
console.log(a.source);
