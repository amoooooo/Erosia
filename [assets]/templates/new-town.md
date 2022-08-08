<%* const { Campaign } = window.customJS;
const title = await tp.system.prompt("Enter Name");
const folder = await Campaign.chooseLocationFolder(tp);
const lower = Campaign.lowerKebab(title);
console.log("%o, %o, %o", title, lower, folder);

await tp.file.move(`${folder}/${lower}`);

const placeTag = `place/town/${lower}`;
console.log("%o", placeTag);

const typeTag = await Campaign.chooseTags(tp, 'type/town', 'type/town');
console.log("%o", typeTag);

const regionTag = await Campaign.chooseTags(tp, 'region/', 'region/sword-coast-north');
console.log("%o", regionTag);

const tags = 'tags';
const dataview = 'dataview';
const aliases = `aliases: ['${title}']`;
-%>
---
<% aliases %>
type: location
<% tags %>: 
- <% typeTag %>
- <% placeTag %>
- <% regionTag %>
---
# <% title %>
<span class="subhead">{{townSize}}, {{context}}</span>

- **Population**
- **Government**

<span class="nav">[Places](#Places) [NPCs](#NPCs) [History](#History)</span>

## Places

```<% dataview %>js
dv.list(dv.pages('#<% placeTag %>')
  .where(p => p.type == "location")
  .sort(p => p.file.name, 'asc')
  .map(k => `[${k.file.aliases[0] ? k.file.aliases[0] : k.file.name}](/${k.file.path})`))
```

## NPCs

```<% dataview %>js
dv.list(dv.pages('#<% placeTag %>')
  .where(p => p.type == "npc")
  .sort(p => p.file.name, 'asc')
  .map(k => `[${k.file.aliases[0] ? k.file.aliases[0] : k.file.name}](/${k.file.path})`))
```

## History
```<% dataview %>
list from #<% placeTag %> and "uvms-players/logs"
```