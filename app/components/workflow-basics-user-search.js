import Component from '@ember/component';
import ENV from '../config/environment';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),
  currentUser: service('current-user'),
  searchInput: '',
  users: [],
  page: 1,
  pageSize: 30,
  totalResults: 0,
  totalPages: Ember.computed('totalResults', 'pageSize', function () {
    return Math.ceil(this.get('totalResults') / this.get('pageSize'));
  }),
  pages: Ember.computed('totalPages', function () {
    let arr = [];
    for (let i = 1; i <= this.get('totalPages'); i += 1) {
      arr.push(i);
    }
    return arr;
  }),
  moreThanOnePage: Ember.computed('pages', function () {
    return (this.get('pages') ? (this.get('pages').length > 1) : false);
  }),
  filteredUsers: Ember.computed('users', function () {
    return this.get('users').filter(u => u.id !== this.get('currentUser.user.id'));
  }),
  actions: {
    toggleModal() {
      this.toggleProperty('isShowingModal');
    },
    searchForUsers(page) {
      if (page === 0 || page === null || page === undefined || !page) {
        page = 1;
      }
      this.set('page', page);
      const size = this.get('pageSize');
      let info = {};
      let input = this.get('searchInput');
      this.get('store').query('user', {
        query: {
          bool: {
            filter: {
              exists: { field: 'email' }
            },
            should: {
              multi_match: { query: input, fields: ['firstName', 'middleName', 'lastName', 'email', 'displayName'] }
            },
            minimum_should_match: 1
          }
        },
        from: (page - 1) * size,
        size,
        info
      }).then((users) => {
        this.set('users', users);
        if (info.total !== null) this.set('totalResults', info.total);
      });
    },
    async pickSubmitter(submitter) {
      if (this.get('model.newSubmission.submitter.id') && this.get('model.newSubmission.grants.length') > 0) {
        let result = await swal({
          type: 'warning',
          title: 'Are you sure?',
          html: 'Changing the submitter will also <strong>remove any grants</strong> currently attached to your submission.  Are you sure you want to proceed?',
          showCancelButton: true,
          cancelButtonText: 'Never mind',
          confirmButtonText: 'Yes, I\'m sure'
        });
        if (result.value) {
          this.set('model.newSubmission.grants', Ember.A());
          toastr.info('All grants removed from submission.');
        }
      }
      this.set('searchInput', '');
      this.set('model.newSubmission.submitterEmail', '');
      this.set('model.newSubmission.submitterName', '');
      this.set('model.newSubmission.submitter', submitter);
      this.set('isShowingModal', false);
    }
  }
});
