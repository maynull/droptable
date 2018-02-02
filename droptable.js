const randomNumber = require("random-number-csprng");

const clean = (module.exports.clean = function(path) {
  return path.replace(/^\//g, "").replace(/\/$/g, "");
});

/**
 *
 * @param {Array.DropTable} items array of droptables
 *
 * @returns {int} total weight of items
 */
function totalWeightInItems(items) {
  return items.reduce(function(total, item) {
    return total + item.traits.weight;
  }, 0);
}
/**
 *
 * @param {Object} properties, optional parameters forcedDepth, stak, weight, isLootable, isAlways
 */
const DropTraits = function(properties) {
  return {
    forcedDepth: properties.forcedDepth,
    stack: properties.stack,
    weight: properties.weight,
    isLootable: properties.isLootable,
    isAlways: properties.isAlways
  };
};

/**
 *
 * @param {string} name         Name of droptable
 * @param {DropTraits} obj Actual droptable object
 */
const DropTable = function(name, traits) {
  return {
    name: name,
    traits: traits,
    branchNames: [],
    branches: {},
    totalWeight: 0,
    /**
     * @param  {int} value weight value
     */
    setWeight: function(value) {
      const oldWeight = this.traits.weight;
      this.traits.weight = value;
      this.totalWeight += value - oldWeight;
    },
    /**
     * @param {DropTable} object adds new item to branches and adds it weight to total
     */
    addObject: function(object) {
      this.branches[object.name] = object;
      this.branchNames.push(object.name);
      this.totalWeight += object.weight;
    },
    /**
     * @param {Array.DropTable} objects adds all objects to branches and add their weight to total
     */
    addObjectsArray: function(objects) {
      objects.forEach(object => {
        this.addObject(object);
      });
    },
    /**
     * @param {Object} properties must include name, optinally include forcedDepth, stack, weight, isLootable, isAlways
     */
    add: function(properties) {
      dtObject = DropTable(properties.name, new DropTraits(properties));
      this.branches[properties.name] = dtObject;
      this.branchNames.push(properties.name);
      this.totalWeight += properties.weight;
    },
    /**
     * @param  {string}  name   Branch name
     *
     * @return {DropTable}      The branch
     */
    branch: function(name) {
      return this.getBranch(name, true);
    },
    /**
     * @param  {string}  name   Branch name
     * @param  {boolean} create If true, and the specified branch does not exist, create one
     *
     * @return {DropTable}      The branch
     */
    getBranch: function(name, create) {
      const path = clean(name).split("/");
      if (
        create === true &&
        path[0] !== this.name &&
        this.branches[path[0]] != null
      ) {
        this.addObject(DropTable(path[0]));
      }
      if (path.length === 1) {
        return path[0] === this.name ? this : this.branches[path[0]];
      } else if (path.length > 1) {
        const head = path.shift();
        const newPath = path.join("/");
        if (this.branches[head] != null) {
          return this.branches[head].getBranch(newPath, create);
        } else if (create === true) {
          return this.branches[head].getBranch(newPath, create);
        } else {
          throw new Error("Branch is null");
        }
      } else {
        throw new Error("Path error");
      }
    },
    /**
     * @param  {int} depth max depth in item search
     *
     * @return {Array}     all items as DropTable
     */
    allItemsInDepth: function(depth) {
      return this.branchNames.reduce(function(items, branchName) {
        items.push(this.branches[branchName]);
        if (depth > 0) {
          items.concat(this.branches[branchName].allItemsInDepth(depth - 1));
        }
      }, []);
    },
    /**
     * Randomly pick an item from branches and return
     *
     * @return {DropTable} picked item
     */
    randomPick: async function() {
      const targetWeight = await randomNumber(0, this.traits.totalWeight);
      let currentWeight = 0;

      return this.branches[
        this.branchNames.find(name => {
          currentWeight += this.branches[name].weight;
          if (currentWeight > targetWeight) {
            return name;
          }
        })
      ];
    },
    /**
     * Roll the dice and return random item from given path
     * @param  {string}  catalogPath path to roll
     * @param  {int}     forcedDepth depth to force for picked item until allow it to be lootable
     *
     * @return {DropTable} picked item
     */
    roll: async function(catalogPath, forcedDepth) {
      const nextBranch = this.getBranch(catalogPath, false);
      let item = await nextBranch.randomPick();

      if (!item.isLootable || forcedDepth > 0) {
        return await this.roll(item, forcedDepth - 1);
      } else {
        return item;
      }
    }
  };
};

module.exports = DropTable;
