// %%

const x = {
	name: 'Name',
	user: {
		name: 'Username',
		id: 123
	}
};
const flattenObject = (obj: any, parentKey = '', res: any = {}) => {
	for (let key in obj) {
		let propName = parentKey ? `${parentKey}.${key}` : key;
		if (typeof obj[key] === 'object' && obj[key] !== null) {
			flattenObject(obj[key], propName, res);
		} else {
			res[propName] = obj[key];
		}
	}
	return res;
};

const flatX = flattenObject(x);
console.log(flatX);
