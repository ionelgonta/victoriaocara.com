# No Mock or Invented Data Policy

## Critical Rule: Never Invent Data

**NEVER create, invent, or generate mock data for this project.** This is a real business website for Victoria Ocara's art gallery.

### What NOT to do:
- ❌ Do not create fictional painting titles
- ❌ Do not invent prices, dimensions, or descriptions  
- ❌ Do not generate placeholder content that looks real
- ❌ Do not create fake artist information
- ❌ Do not make up customer data or orders

### What TO do:
- ✅ Only use real data from existing sources (MongoDB Atlas, backups, documentation)
- ✅ If real data is not available, clearly state this to the user
- ✅ Ask the user to provide real data when needed
- ✅ Use obvious placeholders that are clearly marked as such
- ✅ Restore from actual backups or database exports

### Data Sources Priority:
1. **MongoDB Atlas** - Original production database
2. **Database backups** - Exported dumps from Atlas
3. **User-provided data** - Real information from Victoria Ocara
4. **Existing documentation** - Only if it contains real data references

### When Data is Missing:
If original data cannot be accessed:
1. Inform the user that original data is not accessible
2. Ask the user to provide the real painting information
3. Explain what data is needed (titles, prices, descriptions, images)
4. Do not proceed with invented data

This is a real business - accuracy and authenticity are critical.