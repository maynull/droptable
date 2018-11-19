const randomNumber = require('random-number-csprng');
const Promise = require('bluebird');

async function randomPick(items, totalWeight) {

  let _totalWeight = 0;

  if (totalWeight)
    _totalWeight = totalWeight;

  const itemWeight = items.reduce(function (previous, item) {
    return { weight: previous.weight + item.weight };
  }).weight;

  if (itemWeight > _totalWeight)
    _totalWeight = itemWeight;

  let targetWeight = 0;

  if (_totalWeight > 0) {
    targetWeight = await randomNumber(0, _totalWeight);
  }

  let currentWeight = 0;
  return items.find(item => {
    currentWeight += item.weight;
    if (currentWeight >= targetWeight) {
      return item;
    }
  });
}

function createLootTable(name, minDrop, maxDrop, totalWeight) {
  return {
    name: name,
    _itemEntries: [],
    _minDrop: minDrop,
    _maxDrop: maxDrop,
    _totalWeight: totalWeight,
    /**
     * @param {Object} item item created by createItem
     * @param {int} weight probability of item
     * @param {bool} forceDrop should drop regardless of type?
     * @param {bool} isAlways should alway drop?
     * @param {bool} isUnique is it a unique drop?
     * @param {int} minStack minimum stack in loot
     * @param {int} maxStack maximum stack in loot
     */
    add: function addEntry(item, opts) {
      const defaults = {
        weight: 0,
        forceDrop: false,
        isAlways: false,
        isUnique: false,
        minStack: 1,
        maxStack: 1
      };
      const entry = Object.assign({}, defaults, opts, { item });
      this._itemEntries.push(entry);
    },
    select: async function selectDrop(itemEntry) {
      let stack = itemEntry.minStack;
      if (itemEntry.maxStack > itemEntry.minStack) stack = await randomNumber(itemEntry.minStack, itemEntry.maxStack);
      return {item: itemEntry.item, forceDrop:itemEntry.forceDrop, stack};
    },
    drop: async function dropItem(subItemEntryArr) {
      const filteredItemsEntries = subItemEntryArr === undefined ? this._itemEntries : subItemEntryArr;
      let itemEntry = await randomPick(filteredItemsEntries, this._totalWeight);
      if (itemEntry)
        return await this.select(itemEntry);
      else
        return undefined;
    },
    selectLootFromEntries : async function(entries, count, preStack) {
      let drops = await Promise.all(
        entries
          .filter(itemEntry => {
            if (itemEntry.isAlways) {
              return itemEntry;
            }
          })
          .map(itemEntry => {
            return this.select(itemEntry);
          })
      );
      if (drops.length < count) {
        count -= drops.length;
        for (let i = 0; i < count; i++) {
          const nextDrop = await this.drop(entries);
          if (nextDrop) {
            drops.push(nextDrop);
            if (nextDrop.item.isUnique) {
              entries = entries.filter(item => item !== nextDrop.item);
            }
          }
        }
      }
      let singleDrops = [];
      for(let i = 0; i < drops.length; i++){
        let drop = drops[i];
        if(preStack)
          drop.stack *= preStack;
        if(drop.item && drop.item.dropLoot && !drop.forceDrop){
          const osman = await drop.item.dropLoot(drop.stack);
          osman.forEach((element)=>{
            singleDrops.push(element);
          });
        }else{
          singleDrops.push(drop);
        }
      }
      return singleDrops;
    },
    dropLoot: async function dropLoot(preStack) {
      let curDropCount = 1;
      if(this._maxDrop > this._minDrop) {
        curDropCount = await randomNumber(this._minDrop, this._maxDrop);
      }else{
        curDropCount = this._minDrop;
      }
      let filteredItemEntries = this._itemEntries.slice();
      let drops = await this.selectLootFromEntries(filteredItemEntries, curDropCount, preStack);
      return drops;
    }
  };
}

function createItem(name) {
  return {
    name: name
  };
}

module.exports.createItem = createItem;
module.exports.createLootTable = createLootTable;
