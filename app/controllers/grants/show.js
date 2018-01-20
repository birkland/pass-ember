import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';

export default Controller.extend({

  store: service('store'),

  /* For providing access to a newly created submission object */
  newSubmissionObject: null,

  actions: {

    newSubmission() {
      this.set('newSubmissionObject', this.get('store').createRecord('submission'));
    },

    saveAndLinkGrant() { // AUDIT
      var submission = this.get('newSubmissionObject');
      this.set('newSubmissionObject', null);
      var grant = this.model;

      return submission.save().then(() => { // AUDIT
        submission.get('grants').pushObject(grant);
        return submission.save(); // AUDIT
      }).then(() => {
        grant.get('submissions').pushObject(submission);
        return grant.save(); // AUDIT
      });
    }
  },

  columns: [
    { propertyName: 'title', title: 'Article' },
    { propertyName: 'funder', title: 'Funder' },
    { propertyName: 'author.name', title: 'Corr. Author'},
    { title: 'Repo', component: 'submissions-repo-cell' },
    { propertyName: 'updatedDate', title: 'Last Update Date', component: 'date-cell' },
    { propertyName: 'submittedDate', title: 'Submitted Date', component: 'date-cell' },
    { propertyName: 'status', title: 'Status' },
    { title: 'OAP Repo Id', component: 'submissions-repoid-cell' }
  ],

  themeInstance: Bootstrap4Theme.create()
});
