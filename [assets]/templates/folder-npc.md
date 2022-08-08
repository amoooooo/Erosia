<%* const { Campaign } = window.customJS;
const title = await tp.system.prompt("Enter Name");
const lower = Campaign.lowerKebab(title);
console.log("%o, %o", title, lower);
await tp.file.rename(lower);

const groupTag = await Campaign.chooseTagOrEmpty(tp, 'group', '');
console.log("%o", groupTag);
const placeTag = await Campaign.chooseTagOrEmpty(tp, 'place/', 'place/settlement');
console.log("%o", placeTag);

let tags = '';
if ( placeTag || groupTag ) {
  tags = '\ntags:';
  if ( placeTag ) {
    tags += `\n- ${placeTag}`;
  }
  if ( groupTag ) {
    tags += `\n- ${groupTag}`;
  }
}
console.log("%o", tags);
const aliases = `aliases: ['${title}']`;
-%>
---
<% aliases %>
type: npc<% tags %>
---
# <% title %>
<span class="subhead">{{primary location}}</span>

TL;DR description / personality / motivation

```ad-npc
*{{gender}} {{race}} {{role/occupation}}, {{alignment}}*  
- **Trait**
- **Ideal**
- **Bond**
- **Flaw**
```

<span class="nav">[Details](#Details) [Relationships](#Relationships) [Secrets](#Secrets) [History](#History)</span>

## Details


## Relationships

**Organization or Faction**

## Secrets

## History

Any queries?