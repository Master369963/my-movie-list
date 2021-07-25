const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const Paginator = document.querySelector('#paginator')

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderMovieList(movies)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))

  })
  .catch((err) => console.log(err))

function renderMovieList(data) {
  let rawHTML = ''
  // title, image
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3 mb-2">
        <div class="card h-100">
            <img src="${POSTER_URL + item.image}" class="card-img-top"
              alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
      </div>
    `
  })

  dataPanel.innerHTML = rawHTML
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

function addToFavorite (id) {
  //取目前在local storage裡的資料，放進收藏清單。因第一次使用時local storage為空的，顧會得到空集合
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  //find會於找到符合條件就停下來並回傳該item
  //使用此項找尋符合id相同的電影，並暫存於movie
  const movie = movies.find(movie => movie.id === id)
  if (list.some(movie => movie.id === id)) {
    return alert ('此電影已經收藏在清單中!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`

  })
}

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault()
  //取得搜索關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  //儲存符合篩選條件的項目
  
  //錯誤處理:輸入無效字串 ->移除此項:沒輸入關鍵字時，會顯示所有電影
  // if (!keyword.length) {
  //   return alert('error')
  // }

  //條件篩選: 方法一
  filteredMovies = movies.filter ((movie) => 
    movie.title.toLowerCase().includes(keyword)
  )
  //錯誤處理:無符合條件的結果
  if (filteredMovies.length === 0) {
    searchInput.value = ''
    return alert(`您輸入的關鍵字: ${keyword} 沒有符合條件的電影`)
  }
  //重製分頁器
  renderPaginator(filteredMovies.length)
  //重新輸出畫面為預設第一頁結果
  renderMovieList(getMoviesByPage(1))  
  

   //條件篩選:方法二
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
})

function getMoviesByPage (page) {
  //三元運算子，即為if-else功能，true回傳filteredMovie, False回傳movies
  const data = filteredMovies.length ? filteredMovies : movies
  //計算起始index
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator (amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作template
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li >`
  }
  
  paginator.innerHTML = rawHTML
}

paginator.addEventListener('click', function onPaginatorClicked (event) {
  //若點擊的不是a標籤，結束
  if (event.target.tagName !== 'A') return

  //透過dataset取得點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})
