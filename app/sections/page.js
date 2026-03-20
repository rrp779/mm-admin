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
headers:{ "Content-Type":"application/json"},
body:JSON.stringify({ order:i+1 })
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

/* ================= SEARCH ================= */

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

/* ================= ADD ITEMS ================= */

const addReelProduct = async(product)=>{

if(!pickerSection) return

const updatedItems = [
...pickerSection.items,
{
title:product.title,
productId:product.id,
productTitle:product.title,
productImage:product.image,
price:product.price || "",
video:"",
thumbnail:product.image,
visible:true
}
]

await updateSection(pickerSection._id,{items:updatedItems})
setPickerSection(null)

}

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

await updateSection(pickerSection._id,{items:updatedItems})
setPickerSection(null)

}

/* ================= REMOVE ITEM ================= */

const removeItem = async(section,index)=>{
const updated = section.items.filter((_,i)=>i!==index)
await updateSection(section._id,{items:updated})
}

/* ================= UI ================= */

return(

<div className="p-8">

<div className="flex justify-between mb-6">
<h1 className="text-2xl font-bold">Sections Manager</h1>

<button onClick={addSection} className="bg-black text-white px-4 py-2 rounded">
+ Add Section
</button>
</div>

{sections.map((section,index)=>(

<div key={section._id} className="p-6 shadow rounded mb-6">

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

<select
value={section.type}
onChange={(e)=>updateSection(section._id,{type:e.target.value})}
className="border px-2 py-1"
>
<option value="hero">Hero</option>
<option value="collection_grid">Collection Grid</option>
<option value="collection_slider">Collection Slider</option>
<option value="banner">Banner</option>
<option value="two_column_grid">Two Column Grid</option>
<option value="banner_slider">Banner Multiple</option>
<option value="best_selling">Best Selling</option>
<option value="trending_products">Trending</option>
<option value="reels_section">Reels Section</option>
</select>

<button onClick={()=>deleteSection(section._id)} className="text-red-500">
Delete
</button>

</div>
</div>

{/* ================= ITEMS ================= */}

{/* TWO COLUMN */}
{section.type==="two_column_grid" && (
<div className={
  section.type === "two_column_grid"
    ? "grid grid-cols-2 gap-4"
    : section.type === "banner_slider"
    ? "flex flex-col gap-4"
    : "grid grid-cols-4 gap-4"
}>
{section.items.map((item,i)=>(
<div key={i} className="border p-3 rounded relative">

<button onClick={()=>removeItem(section,i)} className="absolute top-2 right-2 text-red-500">✕</button>

<img src={item.image} className="w-full h-40 object-cover rounded mb-2"/>

<input type="file" onChange={async(e)=>{
const file = e.target.files[0]
const formData = new FormData()
formData.append("image",file)
const res = await fetch(`${API}/upload`,{method:"POST",body:formData})
const data = await res.json()
const updated=[...section.items]
updated[i].image=data.imageUrl
await updateSection(section._id,{items:updated})
}}/>

</div>
))}
</div>
)}

{/* BANNER STACK */}
{section.type==="banner_slider" && (
<div className="flex flex-col gap-4">
{section.items.map((item,i)=>(
<div key={i} className="relative">

<button onClick={()=>removeItem(section,i)} className="absolute top-2 right-2 bg-white px-2 py-1 text-red-500">✕</button>

<img
  src={item.image || item.productImage || item.collectionImage || item.thumbnail}
  className="w-full h-40 object-cover rounded mb-2"
/>
<input type="file" onChange={async(e)=>{
const file = e.target.files[0]
const formData = new FormData()
formData.append("image",file)
const res = await fetch(`${API}/upload`,{method:"POST",body:formData})
const data = await res.json()
const updated=[...section.items]
updated[i].image=data.imageUrl
await updateSection(section._id,{items:updated})
}}/>

</div>
))}
</div>
)}

{/* DEFAULT */}
{section.type!=="two_column_grid" && section.type!=="banner_slider" && (
<div className="grid grid-cols-4 gap-4">
{section.items.map((item,i)=>(
<div key={i} className="border p-3 rounded relative">

<button onClick={()=>removeItem(section,i)} className="absolute top-2 right-2 text-red-500">✕</button>

<img
  src={item.image || item.productImage || item.collectionImage}
  className={
    section.type === "banner_slider"
      ? "w-full h-64 object-cover rounded mb-2"
      : section.type === "two_column_grid"
      ? "w-full h-40 object-cover rounded mb-2"
      : "w-full h-36 object-cover rounded mb-2"
  }
/>

</div>
))}
</div>
)}

<button
onClick={()=>setPickerSection(section)}
className="mt-4 bg-black text-white px-4 py-2 rounded"
>
+ Add Product / Collection
</button>

</div>

))}

</div>
)
}