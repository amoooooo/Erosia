<%* 
const { Campaign } = window.customJS;
const result = await Campaign.nextSession();
console.log("%o", result);
const title = await tp.system.prompt("Enter name for session");
const lower = Campaign.lowerKebab(title);
tR += `# Session on ${result.friday}: ${title}`;
console.log(`${result.friday}-${lower}`);
await tp.file.rename(`${result.friday}-${lower}`);
-%>

## Summary

^summary

---

## Housekeeping


## Recap of Last Session

<%*  tR += `![[${result.lastSession}#^summary]]`; %>

## Create a strong start
%%
- **Objective** single sentence: what is this session about?
- **Twist** some fact that adds depth/complexity to the objective.
- **Opposition** (who/what, motivation)
%%

Hook

## Potential Scenes

- [ ] 
- [ ] 
- [ ] 
- [ ] 

## Secrets and Clues

- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 

## Loot

- [ ] 

## Log / Details
