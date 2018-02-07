# DropTable

A loot/drop implementation in NodeJS that can be used for receiving loots in games.

Create & loot from droptables which can include items, or other droptables using their weights. Weights are arbitrary, not percentages, and don't need to add up to 100.
Read overview of drop tables on
[Lost Garden](http://www.lostgarden.com/2014/12/loot-drop-tables.html).

```javascript
//Create Items
let gold = createItem('gold');
let silver = createItem('silver');
let sword = createItem('sword');
let helmet = createItem('helmet');
//Create Loot Table
let equipmentTable = createLootTable('equipments', dropCount);
//Add Loot Table Entry
equipmentTable.add(sword, { isUnique: true });
equipmentTable.add(helmet, { isUnique: true });
//Create Another Loot Table
let chestOne = createLootTable('gold chest', dropCount);
//Add Loot Table Entry
chestOne.add(gold, { isAlways: true, minStack: 10, maxStack: 50 });
chestOne.add(equipmentTable, { weight: 8, isUnique: true });
//Create Another Loot Table
let chestTwo = createLootTable('silver chest', dropCount);
//Add Loot Table Entry
chestTwo.add(silver, { isAlways: true, minStack: 5, maxStack: 50 });
chestTwo.add(equipmentTable, { weight: 8, isUnique: true });
//Drop Loot from Chest One
let drops = await chestOne.dropLoot();
console.log('chest one loots:');
drops.forEach(drop => {
	console.log(drop.item.name + ' ' + drop.stack);
});
//Drop Loot from Chest Two
drops = await chestTwo.dropLoot();
console.log('chest two loots:');
drops.forEach(drop => {
	console.log(drop.item.name + ' ' + drop.stack);
});
```

Check out tests/dropTest.js to get more idea on feature set.
