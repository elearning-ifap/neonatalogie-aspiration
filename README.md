# Aspiration en néonatologie — version web v3

Formation clinique interactive construite à partir du protocole **Aspiration en service de néonatalogie** et du support d’équipe transmis par le service de néonatologie du CHT Gaston Bourret.

## principes de la v3

- couverture exhaustive et traçable du corpus source ;
- aucune correction clinique implicite ;
- trois formulations restent soumises à validation métier : « souris », « EPPI » et « bébé intubé » / « bébé intubé et sédaté » ;
- infographies pédagogiques construites uniquement à partir du corpus ;
- reprise locale de progression et interface responsive ;
- plein écran disponible.

## fichiers principaux

- `index.html` : parcours web ;
- `assets/style.css` : design system et responsive ;
- `assets/app.js` : navigation, interactions et évaluation ;
- `assets/*.svg` : infographies pédagogiques ;
- `resources/protocole_aspiration_neonatologie.docx` : protocole source ;
- `resources/matrice_couverture_exhaustive_v3.csv` : contrôle exhaustif du corpus ;
- `VALIDATION_METIER.md` : arbitrages métier avant diffusion ;
- `AUDIT_CORPUS_V3.md` : résultat de la vérification v2 → v3.

## choix visuel de publication

La version publiée privilégie les infographies pédagogiques redessinées à partir du corpus. Les pictogrammes du support PowerPoint ne sont pas réutilisés lorsqu’ils n’apportent pas d’information supplémentaire à la compréhension.

## publication

Aucune compilation n’est nécessaire. Conserver `index.html` à la racine du dépôt et activer GitHub Pages sur la branche de publication souhaitée.
