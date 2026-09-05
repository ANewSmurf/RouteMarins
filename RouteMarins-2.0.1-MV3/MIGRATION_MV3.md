# Migration Manifest V3

Cette version 2.0.1 porte RouteMarins de Manifest V2 vers Manifest V3.

## Changements techniques

- `manifest_version` passe à `3`.
- La page d'événement est remplacée par le service worker `eventPage.js`.
- `page_action` est remplacé par `action`.
- `chrome.pageAction` et `chrome.extension.getBackgroundPage()` ne sont plus utilisés.
- Les routes extraites sont stockées par onglet dans `chrome.storage.session`, afin de survivre aux suspensions du service worker.
- La popup charge désormais ses données de façon asynchrone et gère l'absence de route sans erreur JavaScript.
- L'injection est limitée aux pages `chart.pl` de Zezo en HTTP ou HTTPS.
- Les fichiers GPX et KML peuvent être téléchargés directement depuis la popup avec l'API `chrome.downloads`.
- Le répertoire `_metadata` de l'ancien paquet Chrome Web Store n'est pas inclus dans l'archive finale, car ses empreintes ne correspondentraient plus aux fichiers migrés.

## Vérification manuelle

1. Charger le répertoire de l'extension depuis `chrome://extensions`.
2. Vérifier qu'aucune erreur de manifest ou de service worker n'est signalée.
3. Ouvrir une page Zezo `chart.pl` contenant une route et la recharger.
4. Ouvrir la popup RouteMarins et vérifier l'affichage du tableau.
5. Tester l'option **Local Time**, les liens Windy/Toxcct et les exports GPX, KML et Prog.
6. Changer d'onglet Zezo et vérifier que chaque onglet conserve sa propre route.
