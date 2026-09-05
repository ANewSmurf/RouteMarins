# RouteMarins extension for Google Chrome (Manifest V3).
Extract route details returned by [zezo router][zr] an display them in a popup window.

## Installation locale

1. Ouvrir `chrome://extensions`.
2. Activer le mode développeur.
3. Cliquer sur **Charger l'extension non empaquetée**.
4. Sélectionner le répertoire qui contient `manifest.json`.
5. Ouvrir ou recharger une page de routage Zezo, puis cliquer sur l'icône RouteMarins.

La version MV3 conserve les points de route par onglet dans la session Chrome. Si la popup indique qu'aucun point n'a été trouvé, recharger simplement la page Zezo.

Link to get RouteMarins extension:
https://chrome.google.com/webstore/detail/flecfhljmfiblbbcecbabilljdhnmoee?authuser=0&hl=fr

This is built on top of GeGax's Route Zezo.
It brings some additional features including:

- Direct access to Windy with correct position, date, time and GFS forecast model
- Direct access to Toxxct's polars site with correct wind speed, wind angle, options and boat type
- Wind rotation calculation, with alerting on large rotation
- TWA averaging, with alerting on large changes
- KML export to upload route in windy, with all key zezo values displayed in bubles
- Direct GPX and KML downloads from the popup
- Prog export for next 24hours, in either TWA, average TWA, COG, average COG format

## Credits :
This extension is brought to you by EffectiveTeam. It is a fork from GeGax's Route Zezo.
All credits and recognition are for him, many thanks for his great work.

Last official release from GeGax can be download here:
[MultiRaces][m1] or [MonoRace][m2]

[zr]: http://zezo.org/
[m1]: https://chrome.google.com/webstore/detail/route-zezoorg/hfmdbddgjlicmflejkkoafbkdgnfggbg?utm_source=chrome-ntp-icon
[m2]: https://chrome.google.com/webstore/detail/route-zezoorg/dcgkemofanbgjhnbmjjfomcgdkmobhgi?utm_source=chrome-ntp-icon

## Mode developpement et build
npm install -g npm-watch
npm install -g browserify

To build 1 time = 
`browserify popup.js -o bundle.js`

Developer mode, with automatic renuild of bundle.js upon any js/css/html saving =
`npm-watch bundle.js`

### Other usefull docs
https://www.npmjs.com/package/npm-watch


Les notes de GeGax concernant l'installation :

Se placer dans le répertoire du projet :
NPM prend popup.js et ajoute les dépendances pour créer le fichier bundle.js.
Pour activer cette compilation en permanence il faut lancer
• " npm watch "
via la ligne de commande, ça permet à NPM de recompiler bundle.js dés qu'il détecte un changement.

Ca doit créer / mettre à jour le fichier bundle.js

Du coup maintenant popup.html intégre bundle.js au lieu de popup.js.

## A word on the TWA and COG averaging logic

Pour l'algo de moyenne TWA et COG c'est une moyenne glissante des contributions angulaire de chaque point zezo dans une fenetre de +- 3h autour du point considéré avec détection de seuils. C'est pompeux pour dire que :

- on prend un point dans le temps (disons à T+500mn)
- on ne considère que les points qui sont proches temporellement, dans une fénêtre de +-180mn, c'est à dire entre T+320 et T+680 dans notre exemple)
- pour ces points, on vérifie que l'angle de ce segment est à +-10° de l'angle du point de référence, pour détecter les changements de cap important comme les virements & empannages ; si une telle rupture de cap est détectée, on élimine tous les points précédents si la rupture est avant ou suivants si la rupture est après
- avec les points qui restent, on fait la moyenne des angles pondérée par le temps passé à l'angle ; il y a du cosinus, du sinus et de l'arctangente pour ceux qui aiment

Enfin, à l'affichage:

- on vérifie si l'angle reste dans une fénètre de tolérance de +- 3° avec la moyenne du point précédent ; sinon on colorie la case en vert si on est tribord amure, en rouge si on est babord pour faire resortir les changements importants

Voili voilou
