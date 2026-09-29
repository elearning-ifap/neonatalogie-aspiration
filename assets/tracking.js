/*
 * Adaptateur de suivi pour la version web/GitHub.
 * L’interface est volontairement compatible avec le futur adaptateur SCORM.
 * Sur GitHub Pages, la progression est conservée localement par app.js.
 */
const TRACKING={
  initialized:false,
  init(){this.initialized=true;return true;},
  get(){return"";},
  set(){return true;},
  commit(){return true;},
  finish(){return true;},
  interaction(){return true;}
};
