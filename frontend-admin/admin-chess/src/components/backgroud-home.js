import React from "react";


const Backgroudhome = () => {
  return (
    <div className="min-h-screen bg-[#f8f3eb]">
      {/* Navbar */}
      <nav className="bg-orange-900 text-white flex justify-between items-center px-6 py-3">
        <div className="flex items-center space-x-3">
        <a href="/backgroud-home">
          <img
            src="https://ppclink.com/wp-content/uploads/2021/11/co-tuong-online.jpg"
            alt="Logo"
            className="h-10 rounded-lg"
          />
          </a>
          <span className="text-lg font-bold">CoTuong.com</span>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="/chess-register"
            className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold hover:bg-yellow-500 transition"
          >
            ĐĂNG KÝ
          </a>
        </div>
      </nav>


      {/* Hero Section */}
      <div className="relative w-full h-[500px]">
        <img
          src="images/Cover_revised.png"
          alt="Xiangqi Board"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black bg-opacity-30">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            Chơi Cờ Tướng miễn phí <br /> Chơi Đi Bạn EYYYY!
          </h1>
          <div className="mt-6 flex space-x-14">
            <div href="/chess-register"
              className="relative bg-orange-900 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-red-700 transition ">
                
                <a href="/home-page">
                CHƠI NGAY
                </a>
                <img 
                   className="absolute w-12 h-12 rounded-lg shadow-lg top-8 right-0 size-16"
                   src="/images/output-onlinegiftools.gif"
                   alt="anh click chuot"
                />
                
            </div>
            
            <a
              href="/chess-register"
              className="bg-orange-900 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-red-700 transition"
            >
              ĐĂNG KÝ
            </a>
          </div>
        </div>
      </div>
     
      {/* Cờ Tướng là gì? Section */}
      <section className="bg-orange-900 text-white py-16 px-8 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="https://images.squarespace-cdn.com/content/v1/632beb088fad491b42aba9cf/32998c20-6916-4e40-81c5-270944683f74/new%2Bhomepage%2Bimage%2B-%2Bconnecting%2Bxiangqi%2Baround%2Bthe%2Bworld%2B%28100px%2Bwidth%29.png?format=750w"
            alt=" Network"
            className="max-w-sm md:max-w-md"
          />
        </div>
        <div className="w-full md:w-1/2 mt-8 md:mt-0">
          <h2 className="text-3xl font-bold mb-4">Cờ Tướng là gì?</h2>
          <p className="text-lg leading-relaxed">
            Cờ Tướng (phát âm là “shiang-chee”) đã được chơi hàng trăm năm và ngày nay vẫn là một trong những trò chơi cờ phổ biến nhất trên thế giới,
            được chơi ở Trung Quốc và khắp các nước châu Á, và gần đây là cả ở phương Tây. Bạn thường có thể tìm thấy những người chơi cờ tướng ở các khu phố người Hoa trên khắp thế giới.
          </p>
        </div>
      </section>


      {/* Trò chơi đang diễn ra */}
      <section className="bg-[#b71c1c] text-white py-16 px-8 text-center">
        <h2 className="text-3xl font-bold mb-6">Trò chơi đang diễn ra</h2>
        <div className="flex flex-col md:flex-row justify-center space-y-6 md:space-y-0 md:space-x-8">
          {/* Ván cờ 1 */}
          <div className="bg-[#f8f3eb] text-black p-6 rounded-lg shadow-lg w-full md:w-1/3">
            <h3 className="text-lg font-semibold mb-2">Ván cờ đang chơi</h3>
            <p className="text-sm text-gray-700 mb-4">
              <span className="bg-pink-600 text-white px-2 py-1 rounded-full">G</span>
              <span className="font-semibold ml-2">Phamlam</span> (900) International
            </p>
            <img src="/pic04.png" alt="Game 1" className="w-full" />
            <p className="text-sm text-gray-700 mt-4">
              <span className="bg-pink-600 text-white px-2 py-1 rounded-full">G</span>
              <span className="font-semibold ml-2">Xuantung</span> (900) International
            </p>
          </div>


          {/* Ván cờ 2 */}
          <div className="bg-[#f8f3eb] text-black p-6 rounded-lg shadow-lg w-full md:w-1/3">
            <h3 className="text-lg font-semibold mb-2">Ván cờ của tuần qua</h3>
            <p className="text-sm text-gray-700 mb-4">
              <span className="bg-pink-600 text-white px-2 py-1 rounded-full">G</span>
              <span className="font-semibold ml-2">Ngochung</span> (undefined) United States
            </p>
            <img src="/pic05.png" alt="Game 2" className="w-full" />
            <p className="text-sm text-gray-700 mt-4">
              <span className="bg-pink-600 text-white px-2 py-1 rounded-full">G</span>
              <span className="font-semibold ml-2">Hoaithu</span> (undefined) Viet Nam
            </p>
          </div>
        </div>
      </section>
    </div>  
  );
};


export default Backgroudhome;
