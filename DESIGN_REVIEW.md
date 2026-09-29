# Revue design haut de gamme — v2

## Diagnostic de la v1

Les principaux marqueurs donnant une impression générique ou inachevée étaient :

- présence répétée de la mention « prototype v1 » dans l’interface apprenant ;
- shell proche d’un tableau de bord administratif, avec hiérarchie typographique peu différenciée ;
- grand nombre de cartes visuellement équivalentes, produisant un effet « card soup » ;
- illustrations hétérogènes et très schématiques, avec une esthétique proche d’un prototype généré automatiquement ;
- navigation mobile supprimée au lieu d’être réellement adaptée ;
- absence de reprise visuelle des réponses après rechargement ;
- simulation des constantes aléatoire, donc peu reproductible ;
- utilisation d’une alerte navigateur native en fin de parcours ;
- progressions, états actifs et feedbacks fonctionnels mais peu raffinés ;
- double média ANP manquant de cohérence graphique ;
- notes de production trop visibles dans le parcours apprenant.

## Changements appliqués

### `index.html`

- remplacement du bandeau initial par un en-tête produit plus compact : marque, service, titre court, chapitre courant, compteur et progression ;
- ajout d’un vrai menu mobile avec panneau latéral et fond d’occultation ;
- ajout d’un lien d’évitement vers le contenu ;
- simplification du titre affiché dans le chrome de l’application ;
- suppression des mentions « prototype v1 » de l’expérience principale ;
- remplacement du panneau hero générique par `assets/hero_signal.svg` ;
- conservation des trois écarts métier, mais avec une rédaction de revue moins « chantier » ;
- remplacement de la note finale de prototype par un renvoi propre vers `VALIDATION_METIER.md` ;
- ajout d’un toast accessible pour la fin du parcours.

### `assets/style.css`

Le fichier a été entièrement réécrit autour d’un design system cohérent :

- police système haut de gamme : `Segoe UI Variable`, `Aptos`, `Segoe UI` ;
- palette resserrée : bleu nuit, turquoise clinique, orange de vigilance, verts/rouges fonctionnels ;
- échelle typographique plus éditoriale, avec grand titre d’accueil et hiérarchie stable ;
- espacements harmonisés et grille responsive ;
- cartes secondaires plus discrètes, avec filets fins et accent minimal ;
- choix QCM avec repères A/B/C séparés visuellement ;
- cases à cocher personnalisées par état plutôt que par effets décoratifs ;
- feedbacks avec hiérarchie correcte/attention, sans emoji ;
- navigation latérale avec section active et déverrouillage visuel ;
- footer plus compact ;
- animations limitées à des transitions fonctionnelles de 150 à 220 ms ;
- prise en charge de `prefers-reduced-motion` ;
- responsive à 860 px et 520 px ;
- tiroir de navigation mobile ;
- absence de débordement horizontal à 390 px.

### `assets/app.js`

- découplage du code du SCORM : utilisation de l’interface `TRACKING` ;
- progression locale conservée via `localStorage` ;
- réouverture sur le dernier écran ;
- restauration des choix QCM, cases cochées, réglage de pression et ordre DRP ;
- restauration d’une évaluation finale déjà terminée ou partiellement commencée ;
- chapitre courant et libellé de footer mis à jour dynamiquement ;
- élément actif du menu calculé à partir de l’écran courant ;
- ouverture/fermeture accessible du menu mobile ;
- remplacement de l’`alert()` natif par un toast intégré ;
- simulation FC/SpO₂ rendue déterministe pour une expérience pédagogique reproductible ;
- arrêt du timer lorsque l’apprenant quitte l’écran de surveillance ;
- mise à jour du libellé plein écran en fonction de l’état réel ;
- conservation des mêmes fonctions d’interaction pour faciliter le futur packaging SCORM.

### `assets/tracking.js`

Nouveau fichier. Il définit une interface de suivi neutre pour la version GitHub. Au moment du packaging Moodle, cette interface pourra être branchée sur SCORM sans réécrire les interactions pédagogiques.

### Illustrations SVG

Réécriture complète de :

- `hero_signal.svg` ;
- `observation.svg` ;
- `algorithme.svg` ;
- `drp_position.svg` ;
- `anp_mesure.svg` ;
- `anp_geste.svg` ;
- `aop_geste.svg`.

Les visuels utilisent désormais la même palette, la même typographie, les mêmes rayons, la même épaisseur de trait et la même logique éditoriale. Les portraits ou images décoratives ont été volontairement évités : ils n’apportaient pas d’information clinique et risquaient de donner un aspect « stock » ou artificiel.

## Tests réalisés

- 23 écrans présents ;
- absence d’erreur JavaScript lors de la recette navigateur ;
- absence de débordement horizontal en 1440 × 1000 et 390 × 844 ;
- menu mobile ouvrable et fermable ;
- positionnement initial : feedback correct ;
- activité d’observation : validation correcte ;
- réglage de pression à 90 mbar pour prématuré : validation correcte ;
- situation finale : 8 réponses conformes → score 100 % ;
- mode responsive et footer fixe vérifiés ;
- les fichiers de ressources restent accessibles depuis la conclusion.

## Fichier de différence exact

`CHANGES_EXACT.patch` contient le diff textuel complet entre la v1 et cette v2 pour les fichiers de code et SVG. Les ressources binaires sont exclues du patch.
