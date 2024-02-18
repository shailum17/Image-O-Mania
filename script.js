const accessKey = "QYyaNJslBNbzH-DLmgvnhN-PdG6OSI0XpM8YV_fI560";
const searchForm = document.getElementById("search-form");
const searchBox = document.getElementById("search-box");
const searchresult = document.getElementById("search-result");
const showMoreBtn = document.getElementById("show-more-btn");

        /* to access the images from the unsplash website */
 let keyword= "";
 let page =1;
 async function searchImages(){
    keyword = searchBox.value;
    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accessKey}&per_page=12`;
    const response = await fetch(url);
    const data = await response.json();
    const results = data.results;
     
    /* to refresh every time while search to new keyword */ 
    if (page == 1){
        searchresult.innerHTML = "";
    }
    
    /* this will render the images */
    results.map((result)=>{
        const image = document.createElement("img");
        image.src = result.urls.small;
        const imageLink = document.createElement("a");
        imageLink.href = result.links.html;
        imageLink.target = "_blank";
 
        imageLink.appendChild(image);
        searchresult.appendChild(imageLink);
    })
    showMoreBtn.style.display= "block";
    
    
 }
 /* to start from page one */
  searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    page = 1;
    searchImages()
 })
 /* for render more images */
 showMoreBtn.addEventListener("click",()=>{
    page++;
    searchImages();
 })
 