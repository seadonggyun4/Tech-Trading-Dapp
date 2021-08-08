App = {
  web3Provider: null,
  contracts: {},

  init: function () {
    // 데이터 불러오고 html에 매물정보 보이도록 한다.
    $.getJSON("../real-estate.json", function (data) {
      var list = $("#list");
      var template = $("#template");

      for (i = 0; i < data.length; i++) {
        template.find("img").attr("src", data[i].picture); // src 속성에 picture 값을 갖게 한다.
        template.find(".id").text(data[i].id);
        template.find(".type").text(data[i].type);
        template.find(".area").text(data[i].area);
        template.find(".price").text(data[i].price);

        list.append(template.html());
      }
    });
    return App.initWeb3(); // init 역할이 다 끝나면, initWeb3함수를 불러올수 있게 하자.
  },

  initWeb3: function () {
    if (typeof web3 != "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new web3.providers.HttpProvider(
        "http://localhost:8545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("RealEstate.json", function (data) {
      App.contracts.RealEstate = TruffleContract(data);
      App.contracts.RealEstate.setProvider(App.web3Provider);
      App.listenToEvents();
    });
  },

  buyRealEstate: function () {
    var id = $("#id").val();
    var name = $("#name").val();
    var price = $("#price").val();
    var age = $("#age").val();

    console.log(id);
    console.log(name);
    console.log(price);
    console.log(age);

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.RealEstate.deployed()
        .then(function (instance) {
          var nameUtf8Encoded = utf8.encode(name);
          return instance.buyRealEstate(id, web3.toHex(nameUtf8Encoded), age, {
            from: account,
            value: price,
          });
        })
        .then(function () {
          $("#name").val("");
          $("#age").val("");
          $("#buyModal").modal("hide");
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },

  loadRealEstates: function () {
    App.contracts.RealEstate.deployed()
      .then(function (instance) {
        return instance.getAllBuyers.call();
      })
      .then(function (buyers) {
        for (i = 0; i < buyers.length; i++) {
          if (buyers[i] !== "0x0000000000000000000000000000000000000000") {
            var imgType = $(".panel-realEstate")
              .eq(i)
              .find("img")
              .attr("src")
              .substr(7);

            switch (imgType) {
              case "apartment.jpg":
                $(".panel-realEstate")
                  .eq(i)
                  .find("img")
                  .attr("src", "images/apartment_sold.jpg");
                break;
              case "townhouse.jpg":
                $(".panel-realEstate")
                  .eq(i)
                  .find("img")
                  .attr("src", "images/townhouse_sold.jpg");
                break;
              case "house.jpg":
                $(".panel-realEstate")
                  .eq(i)
                  .find("img")
                  .attr("src", "images/house_sold.jpg");
                break;
            }
            $(".panel-realEstate")
              .eq(i)
              .find(".btn-buy")
              .text("매각")
              .attr("disabled", true);
            $(".panel-realEstate")
              .eq(i)
              .find(".btn-buyerInfo")
              .removeAttr("style");
          }
        }
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  listenToEvents: function () {
    App.contracts.RealEstate.deployed().then(function (instance) {
      instance
        .LogBuyRealEstate({}, { from: 0, toBlock: "latest" })
        .watch(function (error, event) {
          if (!error) {
            $("#events").append(
              "<p>" +
                event.args._buyer +
                "계정에서" +
                event.args._id +
                " 번 매물을 매입했습니다." +
                "</p>"
            );
          } else {
            console.error(error);
          }
          App.loadRealEstates();
        });
    });
  },
};

// dapp이 실행되고 페이지가 로드되면 app 안에 init 함수 먼저 실행 ******
$(function () {
  $(window).load(function () {
    App.init();
  });

  // 모달이 띄워져 있으면 부트스트랩 모달에 데이터 전달
  $("#buyModal").on("show.bs.modal", function (e) {
    var id = $(e.relatedTarget).parent().find(".id").text();
    var price = web3.toWei(
      parseFloat($(e.relatedTarget).parent().find(".price").text() || 0),
      "ether"
    );

    $(e.currentTarget).find("#id").val(id);
    $(e.currentTarget).find("#price").val(price);
  });

  $("#buyerInfoModal").on("show.bs.modal", function (e) {
    var id = $(e.relatedTarget).parent().find(".id").text();

    App.contracts.RealEstate.deployed()
      .then(function (instance) {
        return instance.getBuyerInfo.call(id);
      })
      .then(function (buyerInfo) {
        $(e.currentTarget).find("#buyerAddress").text(buyerInfo[0]);
        $(e.currentTarget)
          .find("#buyerName")
          .text(utf8.decode(web3.toUtf8(buyerInfo[1])));
        $(e.currentTarget).find("#buyerAge").text(buyerInfo[2]);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  });
});

// 초기 메타마스크 연결 기능
const ethereumButton = document.querySelector(".enableEthereumButton");

ethereumButton.addEventListener("click", () => {
  //Will Start the metamask extension
  ethereum.request({ method: "eth_requestAccounts" });
});
