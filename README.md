# MOH2E CODE

**MOH2E CODE** est un IDE pédagogique de pseudocode destiné aux étudiants francophones en informatique. Il permet d'écrire, d'analyser et d'exécuter des algorithmes en pseudocode « à la française » (`ALGORITHME`, `VARIABLES`, `DEBUT…FIN`, `POUR…FAIRE`, `SI…ALORS…SINON`, etc.) directement dans le navigateur, sans installation ni compilation. Le code est écrit dans un éditeur Monaco (le moteur de VS Code), puis interprété par un moteur dédié — jamais par `eval()` JavaScript. L'interface fournit une console interactive pour `LIRE`, un panneau d'erreurs cliquables, une vue des variables, un historique des exécutions, une bibliothèque de modèles et des snippets réutilisables.

*Créé par Mohssine Oumiguil.*

Stack : React 18 + TypeScript + Vite 6 + Monaco Editor 0.52. Les tests sont exécutés avec Vitest. Le style est un design system CSS écrit à la main (`src/styles/app.css`, variables de thème, aucune dépendance d'UI tierce) ; l'application n'utilise ni Tailwind ni composants externes.

---

## 1. Installation et commandes

Prérequis : Node.js 18+ et npm.

```bash
npm install      # installe les dépendances
npm run dev      # serveur de développement Vite (http://localhost:5173)
npm run build    # tsc --noEmit puis vite build (sortie dans dist/)
npm run preview  # sert le build de production en local
npm test         # vitest run — lance la suite de tests
```

Noms de scripts exacts (copiés de `package.json`) : `dev`, `build`, `preview`, `test`. Le port de développement est `5173` avec `host: true` (défini dans `vite.config.ts`), le dossier de build est `dist`. Les tests ciblent `tests/**/*.test.ts` dans un environnement `node`.

---

## 2. Carte de l'interface

L'application est une page plein écran (aucune navigation URL) organisée en quatre régions.

### Barre supérieure (`TopBar`)
- **Marque** : logo `M2`, titre `MOH2E CODE`, nom du fichier actif avec un point `●` quand le fichier est un brouillon local (`savedAt === null`).
- **Actions fichier** : *Nouveau fichier*, *Ouvrir un fichier* (input `accept=".algo,.txt,.pseudo"`), *Enregistrer le brouillon*, et un menu *Télécharger* avec `.algo` et `.txt`.
- **Actions d'exécution** : *Pas à pas*, *Exécuter* / *Arrêter* (bouton bascule selon l'état), bascule de console, bascule de thème, bouton de langue `FR`/`EN`, bouton *Raccourcis*, et un indicateur d'état texte.

### Barre latérale d'activités (`SidePanel`, état `SideView`)
Cinq vues sont définies dans `src/state/ide.tsx` (`view: "explorer" | "templates" | "snippets" | "docs" | "settings"`) avec leurs libellés dans `src/i18n/index.ts` :

| Vue (id) | Libellé FR | Contenu |
|---|---|---|
| `explorer` | **Explorateur** | Liste « MES ALGORITHMES » : ouvrir, renommer (double-clic), dupliquer, exporter `.algo`, supprimer. |
| `templates` | **Modèles** | Bibliothèque `MODÈLES PÉDAGOGIQUES`, groupée en *Les bases*, *Conditions*, *Boucles*, *Procédures & fonctions*. |
| `snippets` | **Snippets** | `SNIPPETS RAPIDES` : aperçu de chaque bloc avec bouton *Insérer* au curseur. |
| `docs` | **Documentation** | Aide-mémoire (`AIDE-MÉMOIRE`). |
| `settings` | **Réglages** | Panneau `RÉGLAGES` (thème, langue, notation, garde-fous d'exécution, etc.). |

Chaque vue a son composant dans `src/components/panels/` (`Explorer`, `Templates`, `Snippets`, `Docs`, `Settings`) ; `App.tsx` monte la vue sélectionnée dans le rail latéral.

### Éditeur (`EditorPane`)
Zone Monaco centrale avec onglets par fichier. Chaque fichier possède son propre `ITextModel` (historique *undo* conservé par onglet). Les diagnostics du moteur sont poussés comme marqueurs Monaco (`setModelMarkers`, owner `moh2e`) à chaque frappe (débounced ~380 ms) ; la ligne courante du pas-à-pas est surlignée (`step-line`). Les thèmes Monaco disponibles sont `moh2e-dark` et `moh2e-light`.

### Panneau inférieur (`BottomPanel`)
Quatre onglets (libellés FR exacts) :

| Onglet (id) | Libellé FR | Rôle |
|---|---|---|
| `console` | **Console** | Sorties `ECRIRE`, échos de saisie `LIRE`, avertissements et messages système. La saisie est un champ interactif qui bascule automatiquement sur cet onglet quand le programme attend une valeur. |
| `problems` | **Erreurs** | Liste des diagnostics avec badge de comptage ; **un clic sur une ligne ouvre l'éditeur et centre le curseur sur la ligne concernée** (`onReveal`). Sous chaque erreur corrigeable : bouton **Corriger** + l'explication de la rustine et son étiquette `automatique` / `à vérifier`, plus une barre **Tout corriger (n)** en haut de l'onglet (§ 8.1). |
| `variables` | **Variables** | Tableau Nom / Valeur / Type : instantané à chaque pas en mode pas-à-pas, puis état final après une exécution normale. |
| `history` | **Historique** | 25 dernières exécutions (succès, nombre d'instructions, durée, sortie). |

Le pied du panneau affiche l'état : `En cours…`, `En attente de saisie`, `Pas à pas — ligne N`, `Terminé · X instructions · Y ms`, `Échec · N erreur(s)`, `Arrêté`, ou `Prêt — F5 pour exécuter`. Quand le statut est `paused`, deux mini-boutons apparaissent : *Instruction suivante* et *Continuer*.

### Raccourcis clavier
Les raccourcis suivants sont **vérifiables dans le code** :

| Raccourci | Action | Source |
|---|---|---|
| `F5` | Exécuter | écouteur global `keydown` de `App.tsx` |
| `F9` | Pas à pas | `App.tsx` |
| `F10` | Instruction suivante (en pause) | `App.tsx` (`runner.nextStep()`) |
| `Échap` | Arrêter l'exécution en cours | `App.tsx` |
| `Ctrl+N` | Nouveau fichier | `App.tsx` |
| `Ctrl+O` | Ouvrir un fichier | `App.tsx` (déclenche l'`input type=file`) |
| `Ctrl+S` | Enregistrer le brouillon | `App.tsx` |
| `Ctrl+Maj+S` | Enregistrer sous | `App.tsx` (`saveAs`) |
| `Ctrl+Maj+P` | Afficher / masquer le panneau bas | `App.tsx` |
| `Alt+→` / `Alt+←` | Onglet suivant / précédent | `App.tsx` |
| `Ctrl+Espace` | Déclencher l'auto-complétion | `editor.addCommand(KeyMod.CtrlCmd \| KeyCode.Space)` dans `EditorPane` |
| `Ctrl+.` | Ouvrir la rustine proposée sur la ligne du curseur | `App.tsx` → `editor.trigger("editor.action.quickFix")` + ouverture du panneau bas |
| `Ctrl+F` | Recherche dans le document | commande native Monaco (fournie par l'éditeur) |

Tous ces raccourcis sont enregistrés sur `window` dans le `useEffect` « raccourcis globaux » de [src/App.tsx](src/App.tsx) ; le panneau *Raccourcis* (bouton `⌨` de la barre supérieure, `ShortcutsDialog`) en affiche la liste dans l'application.

### Zones redimensionnables
Les trois zones se prennent à la souris, et l'éditeur prend toujours le reste — rien ne se chevauche jamais.

| Zone | Poignée | Ce qui change |
|---|---|---|
| Barre latérale (Explorateur, Modèles, Snippets, Docs, Réglages) | réglette verticale `.vsplit` entre le panneau et l'éditeur (5 px, `cursor: col-resize`) | largeur `sidebarWidth` → variable CSS `--side-w` posée en inline sur `.work` |
| Éditeur | — (zone flexible `.center`) | suit automatiquement ; Monaco est en `automaticLayout`, il se re-layout tout seul |
| Panneau d'exécution (Console, Erreurs, Variables, Historique) | réglette horizontale `.resizer` au-dessus du panneau | hauteur `panelHeight` (style inline sur `.panel-wrap`) |

Quatre façons d'ajuster, toutes accessibles :

- **glisser** la réglette (pointer capture, `pointerup`/`pointercancel` écoutés sur `window`) ;
- **double-clic** sur une réglette → taille par défaut de la zone ;
- **Tab** puis **flèches** sur la réglette (qui est un `role="separator"` avec `aria-orientation` et `aria-valuenow`) : `←`/`→` pour la barre latérale, `↑`/`↓` pour le panneau, `Maj` = pas de 48 px au lieu de 16 px, **Début** (`Home`) = taille par défaut ;
- la taille en cours s'affiche dans une pastille du pied de page (`Barre latérale · 268 px`) pendant le glisser-déposer puis s'efface après 1 s.

**Le reste est proportionnel, par construction** (`sidebarBounds()` / `panelBounds()` dans [src/state/ide.tsx](src/state/ide.tsx)) : la barre latérale ne dépasse jamais 45 % de la largeur de fenêtre (plafond 560 px, plancher 180 px) et le panneau bas jamais 72 % de la hauteur disponible sous la barre d'outils (plafond 700 px, plancher 110 px) — l'éditeur garde donc toujours de la place, et la console jamais disparaître. Un `resize` sur la fenêtre ré-applique ces bornes : après un passage en petite fenêtre, les zones reviennent d'elles-mêmes dans les clous. Les valeurs rechargées depuis `localStorage` sont re-clampées à l'hygiène (une taille mémorisée sur un grand écran ne casse pas un petit portable).

Les deux tailles sont mémorisées avec la session (clé `moh2e.code.session.v2`, champs `panelHeight`, `panelOpen`, `sidebarWidth`) ; `view` et `prefs` restent gérés séparément. Les valeurs par défaut suivent la largeur de fenêtre (`defaultSidebarWidth()` : 302 px ≥1241 px, 258 px ≥901 px, 214 px en dessous), exactement comme les media queries du CSS.

---

## 3. Grammaire du pseudocode

Le langage est reconnu **sans distinction de casse ni d'accents** (les mots sont canonisés en majuscules, sans accents, sans apostrophes ni traits d'union). Sont également insensibles à la casse : `vrai`/`VRAI`, `Réel`/`REEL`, etc. Les noms d'identifiants peuvent contenir des lettres accentuées (`À-ÿ`), `_`, `'` et des chiffres.

Grammaire simplifiée (ce que le parser descendant récursif accepte réellement) :

```ebnf
Programme    := [ EnTete ] ( SectionVariables | SousProg | CorpsPrincipal )+
EnTete       := ( ALGORITHME | ALGO ) [ Nom ]
SectionVariables := VARIABLES ( DeclarationListe )*
DeclarationListe := Nom ( "," Nom )* ":" Type
Type         := ENTIER | NATUREL | INTEGER
              | REEL | FLOTANT | FLOAT | DOUBLE
              | CHAINE | CARACTERE | CHAR
              | BOOLEEN | BOOLEAN | LOGIQUE
SousProg     := ( PROCEDURE | FONCTION ) Nom [ "(" Parametres ")" ]
                [ ":" Type ] [ SectionVariables ] DEBUT Instruction* FIN
Parametres   := [ Parametre ( "," Parametre )* ]
Parametre    := Nom [ ( PAR | AVEC | PAS ) ( REF | REFERENCE | VAR | VAL | VALEUR ) ] [ ":" Type ]
CorpsPrincipal := DEBUT Instruction* FIN        (* une seule section DEBUT…FIN *)

Instruction  := Affectation | Lecture | Ecriture | SI | POUR | TANTQUE
              | REPETER | SELON | Appel | RETOUR
Affectation  := Nom ( "<-" | "←" | ":=" ) Expression
Lecture      := ( LIRE | RECEVOIR | SAISIR ) [ "(" ] Variable ( "," Variable )* [ ")" ]
Ecriture     := ( ECRIRE | AFFICHER | MONTRER ) [ "(" Expression ( "," Expression )* ")" ]
SI           := SI Expression [ ALORS ] Instruction*
                ( SINONSI Expression [ ALORS ] Instruction* )*
                ( ( SINON [ SI ] | AUTREMENT ) Instruction* )?
                ( FINSI | FIN )
POUR         := POUR Nom ( DE | DU | DES | DANS ) Expression A Expression
                [ PAS Expression ] [ FAIRE ] Instruction* ( FINPOUR | FIN )
TANTQUE      := ( TANT QUE | TANTQUE ) Expression [ FAIRE ] Instruction* ( FINTANTQUE | FIN )
REPETER      := REPETER Instruction* ( JUSQUA | "JUSQU'A" ) Expression
SELON        := SELON [ DE | SUR | DANS ] Expression Instruction*
                ( CAS Valeurs ":" Instruction* )*
                ( AUTREMENT ":" Instruction* )*
                ( FIN | FINSELON | FINCAS )
Valeurs      := Expression ( "," Expression )*        (* liste *)
              | Expression A Expression                (* plage "de…à" *)
              | DE Expression A Expression
Appel        := Nom [ "(" [ Expression ( "," Expression )* ] ")" ] [ Expression* ]
RETOUR       := ( RETOUR | RENVOYER ) [ Expression ]
```

Précédence des expressions (du plus lâche au plus lié) :
`OU` < `ET` < `NON` < comparaison (`= == != <> < > <= >=`) < `+ -` < `* / MOD DIV` < unaire (`- +`) < atome (nombre, chaîne, `VRAI`/`FAUX`, variable, appel, parenthèses).

### Synonymes et variantes orthographiques acceptés
| Mot canonique | Variantes acceptées |
|---|---|
| `ALGORITHME` | `ALGO` |
| `VARIABLES` | `VARIABLE`, `DECLARATION`, `DECLARATIONS` |
| `DEBUT` | `BEGIN` |
| `FIN` | `FINSI`, `FINPOUR`, `FINTANTQUE`, `FINSELON`, `FINREPETER`, `FINCAS`, ainsi que les formes en deux mots (`FIN SI`, `FIN POUR`, `FIN TANT QUE`…) fusionnées par le lexer |
| `ECRIRE` | `AFFICHER`, `MONTRER` |
| `LIRE` | `RECEVOIR`, `SAISIR` |
| `RETOUR` | `RENVOYER` |
| `SELON` | `SUITE` |
| `JUSQU'A` | `JUSQUÀ`, `JUSQUA`, `JUSQU' A` (apostrophe ou espace tolérés) |
| `TANT QUE` | `TANTQUE` |
| `SINON SI` | `SINONSI` (les deux mots sont aussi admis après `SINON`) |
| Types | voir le tableau des types ; ex. `REEL` = `FLOTANT` = `FLOAT` = `DOUBLE` |

### Affectation, comparaison et commentaires
- **Affectation** : les trois notations `←`, `<-` et `:=` sont acceptées **simultanément** et sont toutes normalisées en `<-` par `normalizeSource`. Le caractère `←` (et `⇐`) est aussi reconnu nativement par le lexer.
- **`=` sert UNIQUEMENT à comparer.** Écrire `x = 5` comme affectation est refusé avec le message :
  `Ligne N : « = » sert à comparer. Pour affecter une variable écrivez x ← … (ou <- et :=).`
- **Commentaires** : `//` jusqu'à fin de ligne, `#` jusqu'à fin de ligne, et blocs `{ … }` sur une ligne. (Monaco colorise en plus `/* … */`, mais le moteur n'extrait que `//`, `#` et `{ }`.)
- **Chaînes** : délimitées par `"…"` ou `'…'`, avec échappements `\n` et `\` + caractère. Une chaîne non fermée lève `Chaîne non fermée : guillemet X manquant.`
- **Nombres** : séparateur décimal `.` **ou** `,` accepté (`3,14` → `3.14`).
- **Opérateurs logiques** : `ET`, `OU`, `NON`. **Entiers** : `MOD` (reste), `DIV` (quotient entier). L'opérateur `**` est refusé explicitement, avec un conseil qui renvoie vers la fonction :
  `Ligne N : l'opérateur « ** » n'est pas pris en charge. Pour une puissance, écrivez PUISSANCE(base, exposant).`
- **Sous-programmes imbriqués** : une `PROCEDURE`/`FONCTION` se déclare au niveau du programme, avant le `DEBUT` du corps principal. Définir un sous-programme à l'intérieur d'un corps est refusé :
  `Mot-clé inattendu « PROCEDURE » en début d'instruction (ligne N).`

### Exemple complet

```pseudocode
ALGORITHME SommeEtMoyenne
VARIABLES
    notes : REEL          // type REEL ; synonymes FLOTANT, FLOAT, DOUBLE
    total, n : ENTIER
    moyenne : REEL
DEBUT
    total := 0            // := accepté, normalisé en <-
    n ← 3                 // flèche Unicode
    moyenne <- 0
    POUR i DE 1 A n FAIRE
        notes <- i * 10
        total <- total + notes
    FINPOUR
    moyenne <- total DIV n
    SI moyenne >= 10 ALORS
        AFFICHER("Admis :", moyenne)
    SINONSI moyenne >= 5 ALORS
        ECRIRE("Rattrapage")
    AUTREMENT
        ECRIRE("Recalculé")
    FINSI
FIN
```

---

## 4. Types de données et règles de conversion

Cinq types déclaratifs, avec synonymes normalisés (`TYPE_SYNONYMS` dans `lexer.ts`) :

| Type stocké | Mots acceptés | Valeurs |
|---|---|---|
| `ENTIER` | `ENTIER`, `NATUREL`, `INTEGER` | nombre entier (`…-1, 0, 1…`) |
| `REEL` | `REEL`, `FLOTANT`, `FLOAT`, `DOUBLE` | nombre à virgule (`.` ou `,`) |
| `CHAINE` | `CHAINE` | texte |
| `CARACTERE` | `CARACTERE`, `CHAR` | un seul caractère |
| `BOOLEEN` | `BOOLEEN`, `BOOLEAN`, `LOGIQUE` | `VRAI` / `FAUX` |

Quand une variable est **déclarée sans type** (`VarType` peut être `undefined`), aucune conversion n'est appliquée : la valeur garde son type naturel. Les conversions (`coerce`) appliquées à l'affectation sont :

| Cible | booléen | chaîne | nombre |
|---|---|---|---|
| `ENTIER` | `VRAI`→1, `FAUX`→0 | parsée (`,`→`.`) puis `trunc` ; texte vide/non numérique → **erreur** | partie décimale **tronquée** avec avertissement |
| `REEL` | `VRAI`→1, `FAUX`→0 | parsée ; texte vide/non numérique → **erreur** | inchangé |
| `CHAINE` | `"VRAI"`/`"FAUX"` | inchangé | formaté (`fmt`) |
| `CARACTERE` | idem | chaîne ; si longueur > 1 → **avertissement** | formaté |
| `BOOLEEN` | inchangé | texte ∈ `{VRAI,TRUE,1,OUI,YES,V}` → vrai, `{FAUX,FALSE,0,NON,NO,F}` → faux, sinon **erreur** | `0`→faux, tout autre nombre→vrai |

Autres règles du moteur :
- **Arithmétique** (`toNum`) : un booléen vaut 1/0, une chaîne est parsée (`,`→`.`) ; une valeur non numérique lève une erreur de type runtime.
- **`+`** concatène dès qu'un des opérandes est une chaîne (`str(lv) + str(rv)`), sinon addition numérique.
- **Vraiefausseté** (`truthy`) d'une condition : booléen tel quel, nombre `≠ 0`, chaîne de longueur > 0.
- **Égalité** (`equals`) compare d'abord numériquement (avec conversion), sinon en comparant les chaînes formatées.
- **Ordre** (`< > <= >=`) compare numériquement si les deux bornes sont numériques, sinon par ordre lexicographique ; **trier deux booléens avec `<`/`>` est une erreur**.
- **Affichage** : `ECRIRE(a, b, c)` joint les valeurs par un espace. Les booléens s'affichent `VRAI`/`FAUX` (FR) ou `TRUE`/`FALSE` (EN) ; les nombres sont arrondis à 10 décimales et `-0` s'affiche `0`, `NaN`→`NAN`, infinis→`INFINI`/`-INFINI`.

---

## 5. Fonctions pré-définies

Liste exacte de `src/engine/interpreter/builtins.ts` (`BUILTINS`). Le nombre d'arguments est contrôlé à l'appel (`minArgs`/`maxArgs`), sinon erreur `… attend N argument(s), reçu M. Exemple : …`.

| Fonction | Arguments | Description | Exemple |
|---|---|---|---|
| `ABS(x)` | 1 | Valeur absolue | `ABS(-5) -> 5` |
| `CAR(s, i)` | 2 | Caractère à une position (1 = premier) | `CAR("ALGO", 2) -> L` |
| `CODE(s, i)` | 2 | Code ASCII du caractère à une position | `CODE("A", 1) -> 65` |
| `ENT(x)` | 1 | Partie entière d'un nombre | `ENT(3.9) -> 3` |
| `MAJUSCULE(s)` | 1 | Texte en majuscules | `MAJUSCULE("algo") -> ALGO` |
| `MINUSCULE(s)` | 1 | Texte en minuscules | `MINUSCULE("ALGO") -> algo` |
| `LONGUEUR(s)` | 1 | Nombre de caractères d'un texte | `LONGUEUR("ALGO") -> 4` |
| `PI` | 0 | La constante π | `PI -> 3.14159…` |
| `RACINE(x)` | 1 | Racine carrée (erreur si `x < 0`) | `RACINE(9) -> 3` |
| `ALEATOIRE(a, b)` | 2 | Entier au hasard entre deux bornes | `ALEATOIRE(1, 6) -> dé` |
| `PUISSANCE(a, b)` | 2 | Élévation à une puissance | `PUISSANCE(2, 10) -> 1024` |
| `PARTIE(s, debut[, longueur])` | 2–3 | Sous-texte (position de départ ≥ 1) | `PARTIE("ALGORITHME", 1, 4) -> ALGO` |
| `COS(x)` | 1 | Cosinus (radians) | `COS(0) -> 1` |
| `SIN(x)` | 1 | Sinus (radians) | `SIN(0) -> 0` |
| `MIN(a, b, …)` | 2–10 | Plus petite valeur | `MIN(3, 1, 2) -> 1` |
| `MAX(a, b, …)` | 2–10 | Plus grande valeur | `MAX(3, 1, 2) -> 3` |

Le nom est insensible à la casse pour la recherche (`findBuiltin` compare en majuscules). `RACINE`, `ALEATOIRE` et `PARTIE` lèvent des erreurs dédiées en cas d'argument invalide (racine négative, bornes inversées, départ < 1).

```pseudocode
ALGORITHME TestFonctions
VARIABLES
    t : CHAINE
DEBUT
    t <- "algo"
    ECRIRE(MAJUSCULE(t), LONGUEUR(t), CAR(t, 2))   // ALGO 4 l
    ECRIRE(MAX(2, 9), ENT(7.8), PUISSANCE(2, 10))  // 9 7 1024
FIN
```

---

## 6. Ce qui n'est PAS pris en charge

Le produit est volontairement borné pour rester pédagogique. Voici les limites réelles du code :

- **Tableaux / arrays avec `[ ]`** : non pris en charge. Le nœud d'expression `index` et les crochets existent dans les types Monaco (auto-fermeture), mais l'interpréteur lève une erreur à l'exécution :
  `Erreur ligne N : l'indexation avec [ ] n'est pas encore prise en charge par MOH2E CODE.`
  Pour manipuler des collections, simulez-les avec des variables séparées ou des sous-programmes.
- **Structures / enregistrements (`ENREGISTREMENT`, champs `x.champ`)** : absents de la grammaire — le point `.` n'est qu'un délimiteur.
- **E/S fichier, réseau, temps réel** : aucun. Les seules entrées/sorties sont `LIRE` (champ de la console) et `ECRIRE`/`AFFICHER`.
- **Récursion au-delà de la limite de profondeur** : les appels imbriqués (récursion incluse) sont plafonnés à **48 niveaux**. Au-delà : `trop d'appels imbriqués (limite 48). Votre récursion n'a probablement pas de cas d'arrêt.`
- **Opérateur puissance `**`** : refusé à l'analyse avec le message « l'opérateur « ** » n'est pas pris en charge » qui propose `PUISSANCE(a, b)`. Pas de `TAN`, `LN`, `EXP`, ni `REVERSE`/recherche de sous-chaîne au-delà de `PARTIE`/`CAR`/`CODE`/`LONGUEUR`.
- **Plusieurs corps principaux** : une seule section `DEBUT…FIN` par algorithme (`double_debut`).
- **Limites numériques** : pas de bornes entières fixes (les `ENTIER` sont des doubles JS tronqués) ; au-delà de `Number.MAX_SAFE_INTEGER` (~9e15), la précision n'est pas garantie. L'arrondi d'affichage est à 10 décimales.

### Garde-fous d'exécution (valeurs par défaut)

| Garde | Défaut | Effet | Modifiable dans |
|---|---|---|---|
| `maxSteps` | `300 000` instructions | Stoppe un programme trop long → `limite d'exécution atteinte (300000 instructions)` | **Réglages** (`Limite d'instructions`) + clé `moh2e.code.prefs.v2` |
| `maxLoopIter` | `100 000` itérations | Stoppe une boucle sans fin (`POUR`/`TANT QUE`/`REPETER`) | **Réglages** + `moh2e.code.prefs.v2` |
| `timeLimitMs` | `4 000` ms | Interrompt l'exécution (`exécution interrompue après N ms`) | **Réglages** (`Limite de temps (ms)`) + `moh2e.code.prefs.v2` |
| Profondeur d'appels | `48` frames | Garde dure codée en dur dans l'interpréteur (non exposée aux Réglages) | Code (`callSub`) |
| Historique console | 3 000 lignes / 25 exécutions | Brides d'affichage (non persistantes) | Code (`useRunner`) |

> En **pas à pas**, la limite de temps est relevée à 3 600 000 ms (1 h) par `useRunner`, pour laisser à l'étudiant le temps de raisonner entre chaque instruction. De même, l'horloge de l'interpréteur est **suspendue** (`pauseClock()` / `resumeClock()`) pendant qu'un `LIRE` attend une réponse ou qu'un pas s'affiche : le temps de réflexion n'est jamais compté comme une boucle sans fin. Les valeurs `maxSteps`, `maxLoopIter`, `timeLimitMs` proviennent des préférences (`DEFAULT_PREFS` dans `ide.tsx`) et sont transmises à l'interpréteur à chaque exécution.

---

## 7. Note sur la sécurité de l'interpréteur

Le pseudocode **n'est jamais exécuté via `eval()` JavaScript ni `new Function()`**. Le flux est :

1. **Lexer** (`src/engine/lexer.ts`) : la source est découpée en tokens (mots-clés, identifiants, nombres, chaînes, opérateurs, fins de ligne), avec normalisation casse/accents.
2. **Parser descendant récursif** (`src/engine/parser.ts`) : construction d'un **AST** (`Program` → `Declaration`, `SubProgram`, `Stmt`, `Expr`) avec diagnostics en français, puis **vérifications statiques** (variables non déclarées, doublons, comptage de paramètres).
3. **Interpréteur** (`src/engine/interpreter/index.ts`) : **tree-walking** sur l'AST via des générateurs JavaScript, ce qui permet le pas-à-pas, l'entrée interactive `LIRE` et l'interruption. L'AST n'est jamais converti en code exécutable ; aucune fonction native JS arbitraire n'est exposée au programme.

Conséquence : un algorithme ne peut pas toucher au DOM, au réseau, au système de fichiers, ni échapper au bac-à-sable — il ne dispose que des instructions et des fonctions pré-définies listées ci-dessus, sous les garde-fous de la section 6.

---

## 8. Erreurs et diagnostics

Trois familles de diagnostics (`Diagnostic.kind`), affichées dans l'onglet **Erreurs** et comme marqueurs Monaco :

- **`syntax`** (erreur d'analyse ou de vérification statique) : produites par le lexer/parser avant exécution. `execute()` refuse de démarrer tant qu'au moins un diagnostic de sévérité `error` existe : une faute n'est donc jamais signalée deux fois (aucun doublon analyse/exécution).
- **`runtime`** (erreur d'exécution) : levées par l'interpréteur pendant l'exécution ; l'exécution s'arrête sur la première erreur `severity: "error"`.
- **`lint`** (avertissements) : non bloquants (variable déclarée jamais utilisée, partie décimale ignorée, `CARACTERE` de plus d'un caractère, variable non listée dans `VARIABLES`, etc.).

Chaque diagnostic porte une **ligne**, un **message en français** et, quand c'est possible, un **conseil (`hint`)**. **Cliquer un problème dans l'onglet Erreurs recentre l'éditeur et place le curseur sur la ligne concernée.**

Quelques messages **pris verbatimement** dans le code :

Syntaxe / analyse (`parser.ts`, `lexer.ts`) :
```text
Ligne 4 : « = » sert à comparer. Pour affecter une variable écrivez x ← … (ou <- et :=).
Attendu « ECRIRE » ou « AFFICHER » — trouvé « fin de ligne » (ligne 7).
Il manque le FIN qui ferme le bloc SI ouvert ligne 4.
« x » (ligne 9) ferme le mauvais bloc : attendu FIN (POUR) ouvert ligne 3.
Dans VARIABLES, écrivez : nom : TYPE (ex. note : REEL) — trouvé « 12 » (ligne 2).
Type invalide « NUMBER ». Types acceptés : ENTIER, REEL, CHAINE, CARACTERE, BOOLEEN (ligne 3).
« POUR » est un mot réservé : choisissez un autre nom (ligne 5).
Il manque la section DEBUT … FIN dans l'algorithme.
Chaîne non fermée : guillemet " manquant.
Écrivez : POUR i DE <début> A <fin> [PAS <pas>] FAIRE — attendu DE après « i ».
Ligne 5 : l'opérateur « ** » n'est pas pris en charge. Pour une puissance, écrivez PUISSANCE(base, exposant).
```
Statique (`staticChecks`) :
```text
Erreur ligne 4 : variable « zx » non déclarée.
La variable « a » est déclarée deux fois.
« Fact » attend 1 paramètre(s), reçu 2 (ligne 8).
La variable « note » est déclarée mais jamais utilisée.   (avertissement)
```
Exécution (`interpreter/index.ts`) :
```text
Erreur ligne 6 : division par zéro.
Erreur ligne 6 : modulo par zéro.
Erreur ligne 5 : variable « total » non déclarée ou sans valeur.
Erreur ligne 9 : la boucle POUR dépasse 100000 itérations — variable de boucle inchangée ou borne incorrecte.
Erreur ligne 3 : le PAS d'une boucle POUR ne peut pas être 0 (la boucle ne s'arrêterait jamais).
Erreur ligne 7 : « abc » n'est pas un nombre ; note attend REEL.
Erreur ligne 12 : trop d'appels imbriqués (limite 48). Votre récursion n'a probablement pas de cas d'arrêt.
Erreur : la fonction « Fact » (ligne 3) ne renvoie rien : ajoutez « RETOUR valeur » ou « Fact <- valeur » avant son FIN.
```

Le moteur complète aussi les messages par un conseil contextuel (`hintFor`) : par ex. pour une variable non déclarée → *« Déclarez la variable dans la section VARIABLES avec son type… »*, pour une boucle sans fin → *« Vérifiez la condition d'arrêt et l'incrément de la variable de boucle. »*.

> **Langue** : le moteur peut émettre les messages d'exécution en anglais si la préférence `lang` est à `en` (constructeur `Interpreter` + `this.fr(…)`) ; les messages du **parser sont en français uniquement**.

### 8.1 Correction automatique (auto-fix)

Un débutant écrit souvent la syntaxe avant de comprendre l'algorithme. Chaque diagnostic portant un
`code` peut donc transporter une liste de **rustines** (`Diagnostic.fixes`), produites par
[src/engine/autofix.ts](src/engine/autofix.ts) (`withFixes(source, diagnostics, options)`) au moment de
l'analyse. Une rustine est un modèle structuré, jamais un `replace()` approximatif :

```ts
type FixEdit = { line: number; start: number; end: number; insert: string }; // colonnes 1-based, end exclusif
type Fix = {
  id: string;
  label: { fr: string; en: string };         // bouton « Remplacer = par ← »
  explanation: { fr: string; en: string };    // ce qui va changer et pourquoi
  edits: FixEdit[];
  safe: boolean;                              // peut être appliquée sans réfléchir
};
```

`applyFixes()` convertit ces éditions en offsets absolus (en tenant compte de la fin de ligne réelle du
fichier) et les applique **de la fin vers le début**, donc les unes ne décalent jamais les autres. Les
colonnes fournies par l'analyseur, qui travaille sur un texte normalisé (`←` → `<-`), sont ramenées aux
colonnes de l'éditeur via `rawColumn()`.

**Où l'utilisateur voit la correction :**

| Entrée | Comportement |
|---|---|
| Ampoule Monaco sur la ligne en erreur, ou `Ctrl+.` | `registerCodeActionProvider` ([src/monaco/language.ts](src/monaco/language.ts)) lit les diagnostics mis en cache par `setModelMarkers` et propose chaque rustine en *quick fix* ; la première rustine `safe` est marquée `isPreferred` |
| Onglet **Erreurs**, bouton **Corriger** | applique la rustine choice dans le modèle Monaco via `executeEdits` → **annulable avec `Ctrl+Z`** et synchronisé avec l'état React |
| **Tout corriger (n)** | `autoFixSource()` : boucle de passes |
| `F5` / `F9` avec la préférence **Correction automatique avant exécution** (`prefs.autoFix`, activée par défaut) | corrige d'abord, puis exécute ; chaque rustine appliquée est écrite dans la console (`Correction automatique · ligne 5 : Remplacer = par ←`) et le texte corrigé reste dans l'éditeur |

**La boucle `autoFixSource()`** applique **une seule rustine `safe` par passe** (celle du premier
diagnostic d'erreur), puis **réanalyse** : les numéros de ligne restent donc exacts et une correction ne
peut pas en masquer une autre. Maximum `MAX_AUTOFIX_PASSES = 8` passes ; elle renvoie
`{ source, applied[], remaining }` — `remaining` est le nombre d'erreurs qui subsistent, annoncé tel quel.
Les rustines `safe: false` ne sont **jamais** appliquées automatiquement.

**Règles prises en charge** (code de diagnostic → rustine) :

| `code` | Rustine | `safe` |
|---|---|---|
| `assign_symbol` | `=` (ou `:=`) → `←` selon la notation choisie dans Réglages | oui |
| `missing_fin` | insère `FINSI` / `FINPOUR` / `FINTANTQUE` / `FIN` au bon endroit ; si le dernier `FIN` du fichier ferme en réalité un bloc imbriqué, c'est le fermant de ce bloc qui est inséré | oui |
| `mismatched_fin` | remplace le fermant erroné par le bon (`FINSI` → `FINPOUR`…) | oui |
| `extra_fin` | remplace par le fermant attendu (`swap-closer`) ou propose de supprimer la ligne | swap : oui / suppression : non |
| `expected_kw`, `expected_op`, `eol_expected` | ajoute le mot-clé ou l'opérateur manquant (`ALORS`, `FAIRE`, `)`, `:`…) | `ALORS`/`FAIRE`/`)` : oui |
| `type_expected`, `bad_decl` | corrige le type (`NUMBER` → `REEL`), ajoute les `:` manquants, devine `ENTIER` | type/`:` : oui ; deviner le type : non |
| `undeclared_name` | déclare `nom : TYPE` dans `VARIABLES` — et crée la section `VARIABLES` si elle brille par son absence | oui si la variable est affectée quelque part |
| `dup_decl` | retire le nom dupliqué | oui |
| `unclosed_paren`, `lexer` (chaîne non fermée) | ferme la parenthèse ou le guillemet | oui |
| `for_de`, `for_a`, `tant_que` | insère `DE`, `A` ou `QUE` oublié | oui |
| `no_debut` | ajoute `DEBUT … FIN` autour des instructions | oui |
| `power_operator` (`**`), `unexpected` (ligne `FIN` orpheline) | réécrit en `PUISSANCE(a, b)` / supprime la ligne | **non** : étiquette « à vérifier », jamais appliquée par *Tout corriger* |

**Ce qui n'est volontairement jamais corrigé** : les erreurs d'exécution (`division par zéro`, `boucle
trop longue`, `« abc » n'est pas un nombre`) et les erreurs de logique. Elles sont **expliquées** dans
l'onglet Erreurs avec le texte *« Aucune correction automatique possible : l'erreur vient du sens de
l'algorithme, pas de l'écriture. »* (et son pendant anglais) ainsi que le conseil associé, mais le
moteur ne réécrit pas l'algorithme à la place de l'élève. Une correction automatique ne peut donc pas
transformer silencieusement un exercice faux en exercice juste.

Les erreurs d'exécution restent affichées tant que le texte n'a pas changé depuis l'exécution qui les a
produites (`App.tsx` compare `ranSource` au contenu courant) ; dès qu'on modifie le programme, l'onglet
Erreurs revient à l'analyse en direct, sans ligne fantôme.

> Les étiquettes et explications des rustines sont bilingues (`{fr, en}`) et suivent la langue de
> l'interface ; les messages du moteur restent en français.

---

## 9. Persistance et enregistrement

Tout est **local au navigateur** (`localStorage`), aucune donnée n'est envoyée sur un serveur. Deux clés exactes (`src/state/ide.tsx`) :

| Clé | Contenu | Écriture |
|---|---|---|
| `moh2e.code.session.v2` | session : `files` (nom, contenu, horodatages, `savedAt`), `openTabs`, `activeId`, `view`, `panelHeight`, `panelOpen`, `sidebarWidth` (tailles des zones, § 2) | **autosauvegarde** débouncée à 500 ms, et seulement si `autoSave` est activé ; plus `saveDraft()` explicite |
| `moh2e.code.prefs.v2` | préférences complètes (`Prefs` : thème, langue, taille de police, garde-fous, notation, `autoFix` — correction automatique avant exécution, activée par défaut…) | à chaque changement de préférence |

Détails vérifiables :
- Au premier lancement (aucune session), un fichier **`bienvenue.algo`** d'exemple est créé (`WELCOME` dans `ide.tsx`) ; les nouveaux fichiers partent d'un **squelette** (`ACTION_SKELETON`).
- **Brouillon vs enregistré** : le point `●` dans la barre supérieure et l'Explorateur signale `savedAt === null` — le contenu n'existe **que dans ce navigateur**. *Enregistrer le brouillon* (`Ctrl+S`) écrit la session et pose `savedAt`, mais cela reste du `localStorage`.
- **Télécharger** `.algo` ou `.txt` déclenche un vrai téléchargement fichier via le navigateur (copie portable sur PC) — c'est la seule façon de sortir du stockage local. Les fichiers `.txt`/`.pseudo` importés sont renommés en `.algo`.
- La duplication d'un fichier crée une copie `-copie.algo` repartie en brouillon. La suppression est irréversible (confirmation demandée).
- Si le quota `localStorage` est atteint, l'écriture est ignorée silencieusement (bloqué par `try/catch`).

> Réinitialiser les préférences depuis **Réglages** (`settings.reset`) conserve les algorithmes : seules les `Prefs` reviennent aux `DEFAULT_PREFS`.

---

## 10. Bibliothèque de modèles et snippets

### Modèles (`src/data/templates.ts`, 17 entrées)
Un clic sur un modèle ouvre un fichier prêt à exécuter (les valeurs de `LIRE` attendues sont prévues pour les tests). Groupés en *Les bases*, *Conditions*, *Boucles*, *Procédures & fonctions* :

| # | id | Titre FR | Groupe |
|---|---|---|---|
| 1 | `hello` | Bonjour le monde | bases |
| 2 | `addition` | Addition de deux nombres | bases |
| 3 | `calculatrice` | Calculatrice (4 opérations) | conditions |
| 4 | `rectangle` | Aire d'un rectangle | bases |
| 5 | `moyenne` | Moyenne de deux notes | bases |
| 6 | `pair` | Pair ou impair | conditions |
| 7 | `max2` | Maximum de deux nombres | conditions |
| 8 | `max3` | Maximum de trois nombres | conditions |
| 9 | `signe` | Positif, négatif ou nul | conditions |
| 10 | `pour` | Boucle POUR : comptage | boucles |
| 11 | `somme` | Somme de 1 à N | boucles |
| 12 | `tantque` | Boucle TANT QUE : compte à rebours | boucles |
| 13 | `repeter` | REPETER … JUSQU'A : saisie contrôlée | boucles |
| 14 | `table` | Table de multiplication | boucles |
| 15 | `factorielle` | Factorielle (fonction) | sous_programmes |
| 16 | `procedure` | Procédure avec paramètre | sous_programmes |
| 17 | `selectif` | SELON / CAS | conditions |

### Snippets (déclencheurs → bloc)
Dans l'éditeur, tapez le déclencheur puis `Tab`/`Entrée` dans le menu d'auto-complétion ; depuis le panneau **Snippets**, le bouton *Insérer* place le bloc au curseur. Les 12 déclencheurs :

| Trigger | Bloc inséré |
|---|---|
| `alg` | Squelette complet `ALGORITHME … VARIABLES … DEBUT … FIN` |
| `si` | `SI … ALORS … SINON … FINSI` |
| `sie` | `SI … SINONSI … SINON … FINSI` (cascade) |
| `pour` | `POUR … DE … A … FAIRE … FINPOUR` |
| `tq` | `TANT QUE … FAIRE … FINTANTQUE` |
| `rep` | `REPETER … JUSQU'A` |
| `selon` | `SELON … CAS … AUTREMENT … FIN` |
| `lire` | `LIRE(variable)` |
| `ecrire` | `ECRIRE(…)` |
| `fonction` | `FONCTION …(…) : TYPE … RETOUR …` |
| `procedure` | `PROCEDURE …(…) DEBUT … FIN` |
| `var` | Section `VARIABLES` avec déclaration |

Les snippets utilisent des *placeholders* Monaco (`${1:…}`, listes `${2|ENTIER,REEL,…|}`) navigables avec `Tab`.

---

## 11. Structure du projet

```text
moh2e-code/
├─ index.html                     # coquille SPA (fr), monte #root, charge /src/main.tsx
├─ package.json                   # scripts dev/build/preview/test, deps React+Monaco+Vite
├─ tsconfig.json                  # config TypeScript (strict)
├─ vite.config.ts                 # plugin React, port 5173, outDir dist, test vitest (node)
├─ tests/
│  ├─ engine.test.ts              # 24 tests lexer/parser/interpréteur + garde-fous
│  ├─ templates.test.ts           # exécute chacun des 17 modèles, zéro erreur
│  ├─ autofix.test.ts             # 23 tests des rustines (éditions, colonnes, boucle autoFixSource)
│  └─ layout.test.ts              # 3 tests des bornes proportionnelles des zones
└─ src/
   ├─ main.tsx                    # point d'entrée React : importe la langue Monaco, les styles, monte <App/>
   ├─ App.tsx                     # coquille IDE : layout, raccourcis globaux, panneau redimensionnable, thème
   ├─ engine/
   │  ├─ types.ts                 # types partagés du moteur (Token, Expr, Stmt, Program, Diagnostic, ParseError)
   │  ├─ lexer.ts                 # tokenization + canonisation casse/accents, table de mots-clés, commentaires, chaînes
   │  ├─ parser.ts                # parser descendant récursif, normalizeSource (←/:=→<-), diagnostics FR, staticChecks
   │  ├─ index.ts                 # façade execute() : parse + garde de validation + run piloté par générateurs (onOutput/onInput/onLine)
   │  └─ interpreter/
   │     ├─ index.ts              # tree-walker : types, coercion, boucles, sous-programmes, PAR REF, RETOUR, garde-fous, horloge pausable
   │     └─ builtins.ts           # 16 fonctions pré-définies (ABS, CAR, PARTIE…) + validation d'arguments
   ├─ monaco/
   │  └─ language.ts              # enregistrement langue Monaco : monarch, autoclose, complétion, hover, block highlight, thèmes
   ├─ data/
   │  └─ templates.ts             # 17 modèles pédagogiques + 12 snippets (déclencheurs/insertText)
   ├─ i18n/
   │  └─ index.ts                 # dictionnaire bilingue FR/EN + helper t()
   ├─ styles/
   │  └─ app.css                  # design system complet (thèmes charbon/violet/ambre, panneaux, console, modales, responsive)
   ├─ state/
   │  ├─ ide.tsx                  # contexte IDE : fichiers, onglets, préférences, autosave localStorage, bienvenue/squelette
   │  └─ useRunner.ts             # pilotage exécution : console, pas-à-pas, variables, historique, arrêt
   └─ components/
      ├─ Icon.tsx                 # jeu d'icônes SVG inline
      ├─ TopBar.tsx               # barre supérieure (marque, fichier, exécution, thème/langue)
      ├─ SidePanel.tsx            # rail d'activités + conteneur de vue
      ├─ TabBar.tsx               # onglets de fichiers (sale ●, fermer, nouveau)
      ├─ EditorPane.tsx           # éditeur Monaco multi-onglets, marqueurs, ligne de pas-à-pas, helpers reveal/insert
      ├─ SymbolPalette.tsx        # palette de symboles (←, <=, MOD, ET, parenthèses…) insérés au curseur
      ├─ ShortcutsDialog.tsx      # aide-mémoire des raccourcis (bouton « Raccourcis »)
      ├─ BottomPanel.tsx          # panneau bas : Console / Erreurs / Variables / Historique
      └─ panels/
         ├─ Explorer.tsx          # vue Explorateur (liste des algorithmes locaux)
         ├─ Templates.tsx         # vue Modèles (cartes groupées)
         ├─ Snippets.tsx          # vue Snippets (aperçus + insertion au curseur)
         ├─ Docs.tsx              # vue Documentation (aide-mémoire du langage, clic → exemple dans l'éditeur)
         └─ Settings.tsx          # vue Réglages (thème, langue, notation, garde-fous, réinitialisation)
```

---

## 12. Critères d'acceptation et comment ils ont été vérifiés

`npm test` (Vitest) exécute **67 tests** (`tests/engine.test.ts` : 24, `tests/templates.test.ts` : 17, `tests/autofix.test.ts` : 23, `tests/layout.test.ts` : 3). Les tests appellent la façade `execute()` avec une file d'entrées simulées pour `LIRE` et une collecte des `ECRIRE` : ils valident le chemin complet lexer → parser → interpréteur, sans UI. Les tests d'autofix vérident, eux, le texte **corrigé** (rustine appliquée puis ré-exécutée) et les colonnes exactes après normalisation ; les tests de layout vérifient les bornes de `clampSidebar` / `clampPanel`.

| # | Critère du cahier des charges | Couverture automatique | Vérification dans l'application |
|---|---|---|---|
| 1 | `10 + 5 = 15` | `interpréteur › T1 : addition 10 + 5 = 15` | modèle *Addition* exécuté avec 10 et 5 → console `La somme est : 15` |
| 2 | `LIRE` met en pause et attend la saisie | `T2 : LIRE interrompt et reprend`, `T2b : le temps de réflexion de l'élève ne consomme pas la limite de temps` | statut « En attente de saisie », champ de la console, exécution reprend après validation |
| 3 | `SI/SINON` prend la bonne branche | `T3 : SI / SINON choisit la bonne branche` | nombre impair 7 → sortie `7 est IMPAIR` |
| 4 | `POUR 1..5` somme = 15 | `T4 : boucle POUR somme 1..5 = 15` | modèle *Somme de 1 à N* avec N = 5 |
| 5 | Fermeture automatique des parenthèses / crochets / guillemets | (règle Monaco, non testée en Node) | `()` `[]` `{}` `""` testés dans l'éditeur réel : le curseur se place entre les deux caractères |
| 6 | Autocomplétion mots-clés + variables déclarées | (provider Monaco) | `Ctrl+Espace` suggère les mots-clés, les types, les variables du fichier et les blocs de fermeture |
| 7 | Erreurs de syntaxe avec numéro de ligne exact | `parser › signale un FIN SI manquant`, `signale une variable non déclarée`, `refuse = seul comme affectation`, `refuse ** …`, `les erreurs de déclaration bloquent l'exécution (pas de double rapport)` | onglet **Erreurs** : message FR + ligne, clic → curseur sur la ligne ; un seul rapport pour une faute |
| 8 | Boucles infinies stoppées sans planter | `interpréteur › T8 : boucle infinie stoppée`, `division par zéro avec numéro de ligne` | `TANT QUE VRAI FAIRE` → erreur affichée, l'interface reste réactive |
| 9 | Sauvegarde / réouverture sans perte | (logique `ide.tsx`) | rechargement de la page : fichiers, onglets, curseur et préférences restaurés depuis `localStorage` ; distinction brouillon `●` / enregistré |
| 10 | « Exécuter » lance le vrai algorithme | les 17 tests de modèles + T1..T8 | bouton *Exécuter* (vert) et `F5` sur chaque modèle de la bibliothèque |
| 11 | Fonctionne sans clé API ni réseau | `tsc --noEmit` + build : aucune dépendance réseau dans le moteur | 100 % hors-ligne ; les appels `fetch`/`XMLHttpRequest` n'existent pas dans `src/` |
| 12 | Utilisable sur un poste Windows classique | (responsive CSS) | build `dist/` servi localement, mise en page testée à ≤1240 px, thème sombre par défaut |
| 13 | Correction automatique d'une erreur de syntaxe | les 23 tests de `tests/autofix.test.ts` | ampoule Monaco + `Ctrl+.`, bouton **Corriger**, **Tout corriger**, et `F5` avec `autoFix` : le texte est corrigé, la correction est annoncée dans la console et annulable (`Ctrl+Z`) |
| 14 | Zones réglables à la souris (barre latérale / éditeur / console) | les 3 tests de `tests/layout.test.ts` (bornes proportionnelles) | glisser les deux réglettes, double-clic = défaut, `Tab` + flèches, `Début` = défaut ; l'éditeur reprend l'espace laissé, tailles retrouvées après rechargement |

Complément de non-régression :

- `modèles › <id> s'exécute` — **17 tests générés** (un par modèle, `hello` → `selectif`) : chaque modèle est analysé et exécuté (`timeLimitMs: 8000`), sans aucun diagnostic d'erreur, avec `success === true`, et la sortie contient la chaîne attendue (`expected`) quand elle est définie.

### Limites honnêtes de la vérification

Ce qui reste à valider à la main sur un poste (rien de cela ne dépend du moteur) : le rendu visuel fin (polices, espacements, thème clair), le ressenti clavier de la fermeture automatique et des `Tab` de placeholders de snippet, le **téléchargement réel** d'un `.algo` (Blob + clic programmé) et l'**import** via la boîte de dialogue du système.

Pour la correction automatique, la vérification automatisée (navigateur sans interface visible) a pu confirmer que l'ampoule Monaco apparaît bien sur la ligne en erreur — donc que le *code action provider* renvoie les rustines — mais **pas** l'ouverture du menu de l'ampoule ni du champ `Ctrl+.`, qui réclament de vrais événements souris/clavier. Les mêmes éditions ont cependant été appliquées et validées par le chemin **Corriger** (qui utilise `fixToWorkspaceEdits` à l'identique), y compris `Ctrl+Z` pour les annuler.

---

*MOH2E CODE — IDE pédagogique de pseudocode. Créé par Mohssine Oumiguil.*
