import Controller from '@ember/controller';
import _ from 'lodash';

export default Controller.extend({
  metadataBlobNoKeys: Ember.computed('model.sub.metadata', function () { // eslint-disable-line
    let metadataBlobNoKeys = {};
    if (this.get('model.sub.metadata')) {
      JSON.parse(this.get('model.sub.metadata')).forEach((ele) => {
        for (var key in ele.data) {
          if (ele.data.hasOwnProperty(key)) {
            let strippedData = ele.data[key].replace(/(<([^>]+)>)/ig, '');
            if (key === 'authors') {
              if (metadataBlobNoKeys['author(s)']) {
                metadataBlobNoKeys['author(s)'] = _.uniqBy(metadataBlobNoKeys['author(s)'].concat(strippedData), 'author');
              } else {
                metadataBlobNoKeys['author(s)'] = strippedData;
              }
            } else {
              metadataBlobNoKeys[key] = strippedData;
            }
          }
        }
      });
    } else {
      metadataBlobNoKeys = { error: 'no metadata' };
    }
    return metadataBlobNoKeys;
  }),
});