"use client";

import { useEffect, useState, useRef } from "react";

const API = "https://mm-backend-production-f67e.up.railway.app/api";

export default function SectionsPage() {

const [sections,setSections] = useState([]);
const [pickerSection,setPickerSection] = useState(null);

const [searchQuery,setSearchQuery] = useState("");
const [searchResults,setSearchResults] = useState([]);
const [isSearching,setIsSearching] = useState(false);
const [searchType,setSearchType] = useState("product");

const searchTimeout = useRef(null);

/* ================= FETCH SECTIONS ================= */

const fetchSections = async () => {

try{

const res = await fetch(`${API}/sections`);
const data = await res.json();

setSections(
Array.isArray(data)
? data.sort((a,b)=>a.order-b.order)
: []
)

}catch(e){

console.error(e)
setSections([])

}

}

useEffect(()=>{
fetchSections()
},[])

/* ================= UPDATE SECTION ================= */

const updateSection = async(id,data)=>{

await fetch(`${API}/sections/${id}`,{
method:"PUT",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify(data)
})

fetchSections()

}

/* ================= DELETE SECTION ================= */

const deleteSection = async(id)=>{

await fetch(`${API}/sections/${id}`,{
method:"DELETE"
})

fetchSections()

}

/* ================= MOVE SECTION ================= */

const moveSection = async(index,direction)=>{

const newSections = [...sections]

const swapIndex =
direction==="up"
? index-1
: index+1

if(swapIndex<0 || swapIndex>=newSections.length)
return

const temp = newSections[index]

newSections[index] = newSections[swapIndex]
newSections[swapIndex] = temp

for(let i=0;i<newSections.length;i++){

await fetch(`${API}/sections/${newSections[i]._id}`,{

method:"PUT",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
order:i+1
})

})

}

fetchSections()

}

/* ================= ADD SECTION ================= */

const addSection = async()=>{

await fetch(`${API}/sections`,{

method:"POST",

headers:{ "Content-Type":"application/json"},

body:JSON.stringify({

title:"New Section",

type:"reels_section",

order:sections.length+1,

visible:true,

settings:{
layout:"column",
columns:4,
backgroundColor:"#ffffff",
gradientStart:"",
gradientEnd:"",
backgroundImage:"",
overlayOpacity:0,
paddingTop:16,
paddingBottom:16,
containerWidth:"full",
borderRadius:0,
sliderStyle:"small"
},

items:[]

})

})

fetchSections()

}

/* ================= SEARCH PRODUCTS / COLLECTIONS ================= */

const fetchSearch = async(query)=>{

if(!query || query.length<2){
setSearchResults([])
return
}

try{

setIsSearching(true)

const res = await fetch(
`${API}/shopify/search?type=${searchType}&q=${query}`
)

const data = await res.json()

setSearchResults(Array.isArray(data)?data:[])

}catch(e){

console.error(e)
setSearchResults([])

}finally{

setIsSearching(false)

}

}

/* ================= ADD PRODUCT ================= */

const addReelProduct = async(product)=>{

if(!pickerSection) return

const updatedItems = [

...pickerSection.items,

{
title:product.title,
productId:product.id,
productTitle:product.title,
productImage:product.image,
video:"",
thumbnail:product.image,
visible:true
}

]

await updateSection(
pickerSection._id,
{items:updatedItems}
)

setPickerSection(null)

}

/* ================= ADD COLLECTION ================= */

const addReelCollection = async(collection)=>{

if(!pickerSection) return

const updatedItems = [

...pickerSection.items,

{
title:collection.title,
collectionId:collection.id,
collectionTitle:collection.title,
collectionImage:collection.image,
video:"",
thumbnail:collection.image,
visible:true
}

]

await updateSection(
pickerSection._id,
{items:updatedItems}
)

setPickerSection(null)

}

/* ================= REMOVE ITEM ================= */

const removeItem = async(section,index)=>{

const updated = section.items.filter((_,i)=>i!==index)

await updateSection(section._id,{items:updated})

}

/* ================= IMAGE RESOLVER ================= */

const getItemImage = (item) => {

return (
item.image ||
item.thumbnail ||
item.productImage ||
item.collectionImage ||
""
)

}

/* ================= UI ================= */

return(

<div className="p-8">

<div className="flex justify-between mb-6">

<h1 className="text-2xl font-bold">
Sections Manager
</h1>

<button
onClick={addSection}
className="bg-black text-white px-4 py-2 rounded"
>

+ Add Section

</button>

</div>

{/* ================= SECTIONS ================= */}

{sections.map((section,index)=>(

<div
key={section._id}
className="p-6 shadow rounded mb-6"
style={{
background: section.settings?.gradientStart && section.settings?.gradientEnd
? `linear-gradient(90deg, ${section.settings.gradientStart}, ${section.settings.gradientEnd})`
: section.settings?.backgroundColor,

backgroundImage: section.settings?.backgroundImage
? `url(${section.settings.backgroundImage})`
: "none",

backgroundSize:"cover",
backgroundPosition:"center"
}}
>

{/* HEADER */}

<div className="flex justify-between items-center mb-4">

<input
value={section.title}
onChange={(e)=>updateSection(section._id,{title:e.target.value})}
className="border px-2 py-1 font-bold"
/>

<div className="flex gap-3 items-center">

<button onClick={()=>moveSection(index,"up")}>↑</button>
<button onClick={()=>moveSection(index,"down")}>↓</button>

<input
type="color"
value={section.settings?.gradientStart || ""}
onChange={(e)=>updateSection(section._id,{
settings:{...section.settings,gradientStart:e.target.value}
})}
/>

<input
type="color"
value={section.settings?.gradientEnd || ""}
onChange={(e)=>updateSection(section._id,{
settings:{...section.settings,gradientEnd:e.target.value}
})}
/>

<select
value={section.type}
onChange={(e)=>updateSection(section._id,{type:e.target.value})}
className="border px-2 py-1"
>

<option value="hero">Hero</option>
<option value="collection_grid">Collection Grid</option>
<option value="collection_slider">Collection Slider</option>
<option value="banner">Banner</option>
<option value="best_selling">Best Selling</option>
<option value="trending_products">Trending</option>
<option value="reels_section">Reels Section</option>

</select>

<button
onClick={()=>deleteSection(section._id)}
className="text-red-500"
>

Delete

</button>

</div>

</div>

{/* ITEMS */}

<div className="grid grid-cols-4 gap-4">

{section.items.map((item,i)=>(

<div
key={i}
className="border p-3 rounded relative"
>

<button
onClick={()=>removeItem(section,i)}
className="absolute top-2 right-2 text-red-500"
>

✕

</button>

{section.type==="reels_section" && item.video ? (

<video
src={item.video}
className="w-full h-36 object-cover rounded mb-2"
controls
/>

) : (

<img
src={getItemImage(item)}
className="w-full h-36 object-cover rounded mb-2"
/>

)}

<p className="text-xs font-semibold">
{item.title || item.productTitle || item.collectionTitle}
</p>

</div>

))}

</div>

<button
onClick={()=>setPickerSection(section)}
className="mt-4 bg-black text-white px-4 py-2 rounded"
>

+ Add Reel Product / Collection

</button>

</div>

))}

{/* ================= MODAL ================= */}

{pickerSection && (

<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">

<div className="bg-white p-6 w-[700px] rounded max-h-[85vh] overflow-y-auto">

<h2 className="font-bold mb-4 text-lg">
Select Product / Collection
</h2>

<div className="flex gap-3 mb-4">

<button
onClick={()=>setSearchType("product")}
className={`px-3 py-1 rounded ${
searchType==="product"
? "bg-black text-white"
: "bg-gray-200"
}`}
>
Products
</button>

<button
onClick={()=>setSearchType("collection")}
className={`px-3 py-1 rounded ${
searchType==="collection"
? "bg-black text-white"
: "bg-gray-200"
}`}
>
Collections
</button>

</div>

<input
type="text"
placeholder="Search..."
value={searchQuery}

onChange={(e)=>{

const value = e.target.value
setSearchQuery(value)

if(searchTimeout.current){
clearTimeout(searchTimeout.current)
}

searchTimeout.current = setTimeout(()=>{
fetchSearch(value)
},400)

}}

className="border px-3 py-2 w-full rounded"
/>

{isSearching ? (

<p className="mt-4">Searching...</p>

):(

<div className="grid grid-cols-3 gap-4 mt-4">

{searchResults.map((item)=>(

<div
key={item.id}

onClick={()=>{

if(searchType==="product"){
addReelProduct(item)
}else{
addReelCollection(item)
}

}}

className="border p-3 rounded cursor-pointer hover:bg-gray-100"
>

<img
src={item.image}
className="w-full h-28 object-cover mb-2 rounded"
/>

<p className="text-sm">
{item.title}
</p>

</div>

))}

</div>

)}

<button
onClick={()=>setPickerSection(null)}
className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
>

Close

</button>

</div>

</div>

)}

</div>

)

}