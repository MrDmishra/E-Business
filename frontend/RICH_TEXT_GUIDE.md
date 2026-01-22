# Rich Text Editor Guide - Shipping Info

The Shipping Info description field now supports rich text editing with advanced features.

## Available Features

### Text Formatting
- **Bold**, *Italic*, Underline, Strikethrough
- Headers (H1, H2, H3)
- Text colors and background colors
- Numbered and bullet lists
- Text alignment (left, center, right, justify)

### Media
- **Images**: Click the image icon in the toolbar
  - Paste image URL
  - Images will be automatically sized to fit
  
### Links
- Click the link icon to add hyperlinks
- Highlight text and click link to make it clickable

### Code & Quotes
- Blockquotes for highlighting important text
- Code blocks for technical information
- Inline code snippets

## Adding Images

1. Click the **image icon** (🖼️) in the toolbar
2. Enter the image URL (must be publicly accessible)
3. Press Enter
4. Image will appear in the editor

**Image URL Examples:**
- `https://example.com/shipping-box.jpg`
- `https://your-cdn.com/images/delivery-truck.png`

## Creating Tables (Alternative Methods)

Since Quill doesn't have built-in table support, you can:

### Option 1: Use HTML directly in code view
The editor saves HTML, so you can edit the database directly with HTML tables:

```html
<table>
  <thead>
    <tr>
      <th>Shipping Method</th>
      <th>Delivery Time</th>
      <th>Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Standard</td>
      <td>5-7 days</td>
      <td>$5.99</td>
    </tr>
    <tr>
      <td>Express</td>
      <td>2-3 days</td>
      <td>$12.99</td>
    </tr>
  </tbody>
</table>
```

### Option 2: Use formatted lists
- **Standard Shipping**
  - Delivery: 5-7 business days
  - Cost: $5.99
  
- **Express Shipping**
  - Delivery: 2-3 business days
  - Cost: $12.99

## Best Practices

1. **Keep descriptions concise** - Use headers to organize content
2. **Use images sparingly** - Large images can slow page loading
3. **Test links** - Ensure all URLs are valid and accessible
4. **Preview content** - Save and view the display to ensure formatting looks good

## Example Shipping Info

### Title: "Domestic Shipping Options"

### Description:
We offer multiple shipping options to meet your needs:

**Standard Shipping**
Delivery in 5-7 business days
Perfect for non-urgent orders

**Express Shipping** 
Delivery in 2-3 business days
Great for gifts and time-sensitive purchases

*Free shipping on orders over $50!*

[Track your order](https://example.com/tracking)

---

Need help? Contact our support team at support@example.com
