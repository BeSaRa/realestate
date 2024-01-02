// @ts-ignore
function CriteriaField(name, isRelation, isManyToOne, isManyToMany, relationKey, relationField, operator) {
  this.name = name;
  this.isRelation = isRelation;
  this.isManyToOne = isManyToOne;
  this.isManyToMany = isManyToMany;
  this.relationKey = relationKey;
  this.relationField = relationField;
  this.operator = operator;
}

const criteriaFields = new Map();
/**
 new CriteriaField('municipalityId', true, true, false, 'LookupKey', '', '_eq')
 new CriteriaField('areaCode', true, true, false, 'LookupKey', '', '_eq')
 new CriteriaField('purposeList', true, true, false, 'Dim_Rent_Rent_Purpose_Id', 'LookupKey', '_in')
 new CriteriaField('propertyTypeList', true, true, false, 'Dim_Rent_Property_Type_Id', 'LookupKey', '_in')
 new CriteriaField('issueDateYear', false, false, false, '', '', '_eq')
 new CriteriaField('realEstateValueFrom', false, false, false, '', '', '_eq')
 new CriteriaField('realEstateValueTo', false, false, false, '', '', '_eq')
 new CriteriaField('issueDateQuarterList', true, false, true, 'quarters_id', 'lookupKey', '_in')
 **/
criteriaFields.set('municipalityId', new CriteriaField('municipalityId', true, true, false, 'LookupKey', '', '_eq'));
criteriaFields.set('areaCode', new CriteriaField('areaCode', true, true, false, 'LookupKey', '', '_eq'));
criteriaFields.set(
  'purposeList',
  new CriteriaField('purposeList', true, false, true, 'Dim_Rent_Rent_Purpose_Id', 'LookupKey', '_in')
);
criteriaFields.set(
  'propertyTypeList',
  new CriteriaField('propertyTypeList', true, false, true, 'Dim_Rent_Property_Type_Id', 'LookupKey', '_in')
);
criteriaFields.set(
  'issueDateQuarterList',
  new CriteriaField('issueDateQuarterList', true, false, true, 'quarters_id', 'lookupKey', '_in')
);
criteriaFields.set('issueDateYear', new CriteriaField('issueDateYear', false, false, false, '', '', '_eq'));
criteriaFields.set('realEstateValueFrom', new CriteriaField('realEstateValueFrom', false, false, false, '', '', '_eq'));
criteriaFields.set('realEstateValueTo', new CriteriaField('realEstateValueTo', false, false, false, '', '', '_eq'));

criteriaFields.set('areaFrom', new CriteriaField('areaFrom', false, false, false, '', '', '_eq'));
criteriaFields.set('areaTo', new CriteriaField('areaTo', false, false, false, '', '', '_eq'));

function createManyToMany(field, payload) {
  return {
    [field.name]: {
      [field.relationKey]: {
        [field.relationField]: {
          [field.operator]: payload[field.name],
        },
      },
    },
  };
}

function createManyToOne(field, payload) {
  return {
    [field.name]: {
      [field.relationKey]: {
        [field.operator]: payload[field.name],
      },
    },
  };
}

function createNormal(field, payload) {
  return {
    [field.name]: {
      [field.operator]: payload[field.name],
    },
  };
}

module.exports = async function (data) {
  return Object.keys(data.payload)
    .filter((key) => {
      return criteriaFields.has(key);
    })
    .map((key) => {
      const field = criteriaFields.get(key);
      return field.isRelation
        ? field.isManyToOne
          ? createManyToOne(field, data.payload)
          : createManyToMany(field, data.payload)
        : createNormal(field, data.payload);
    });
};
