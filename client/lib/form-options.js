import {Makes, Districts} from '/collections/collections.js';
import {FUELTYPES, TRANSMISSIONTYPES,
        WHEELDRIVETYPES, BODYTYPES} from '/collections/constants.js';


export function makeIdOptions() {
  return Makes.find().map((m) => {
    return {'label': m.name, 'value': m._id, 'data-allowed': m.allowed};
  });
  return options;
}

export function districtOptions() {
  const options = [];
  const districts = Districts.find().fetch();
  const groupedDistricts = _.groupBy(districts, (district) => {
    return district['region'];
  });
  const sortedRegions = _.keys(groupedDistricts).sort();
  sortedRegions.forEach((region) => {
    const suboptions = [];
    groupedDistricts[region].forEach((district) => {
      suboptions.push({
        label: district['district'],
        value: district['_id']
      });
    });
    options.push({
      optgroup: region,
      options: suboptions
    });
  });
  return options;
}

export function fuelOptions() {
  return Object.keys(FUELTYPES).map((value, index) => {
    return {'label': FUELTYPES[value]['es'], 'value': value};
  });
}

export function transmissionOptions() {
  return Object.keys(TRANSMISSIONTYPES).map((value, index) => {
    return {'label': TRANSMISSIONTYPES[value]['es'], 'value': value};
  });
}

export function wheelDriveOptions() {
  return Object.keys(WHEELDRIVETYPES).map((value, index) => {
    return {'label': WHEELDRIVETYPES[value]['es'], 'value': value};
  });
}

export function bodyOptions() {
  return Object.keys(BODYTYPES).map((value, index) => {
    return {'label': BODYTYPES[value]['es'], 'value': value};
  });
}
