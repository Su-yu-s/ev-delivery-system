// 单位里程耗电率 (kWh/km)
const POWER_CONSUMPTION_RATE = 0.2;

// 高德地图密钥 - 将从后端动态获取
window._AMapSecurityConfig = {
    securityJsCode: "",  // 将通过API动态设置
  };

// 版本标记：配送小贴士已优化为单卡片结构 v20241122002
console.log('%c✅ 配送小贴士 v20241122002 - 单卡片结构已加载（无嵌套）', 'background: #0a6cff; color: white; font-weight: bold; font-size: 14px; padding: 5px 10px; border-radius: 3px;');

// 路线规划函数
class RoutePlanner {
  constructor() {
    this.map = null;
    this.driving = null;
    this.placeSearch = null;
    this.amapKey = '';  // 将从后端获取
    this.loadConfig().then(() => this.initializeMap());
  }

  // 从后端加载API配置
  async loadConfig() {
    try {
      const response = await fetch('/api/config/amap');
      const result = await response.json();
      if (result.code === 200 && result.data) {
        this.amapKey = result.data.key;
        window._AMapSecurityConfig.securityJsCode = result.data.securityCode;
      }
    } catch (error) {
      console.error('加载地图配置失败:', error);
    }
  }

  // 初始化地图和相关服务
  initializeMap() {
    this.mapInitialized = false;
    const mapKey = this.amapKey || "3e7b39d72d1bb654155984295df22ea1";  // 优先使用后端配置
    AMapLoader.load({
      key: mapKey,
      version: "2.0",
      plugins: ["AMap.Driving", "AMap.Adaptor", "AMap.PlaceSearch", "AMap.Geolocation"]
    }).then((AMap) => {
      this.map = new AMap.Map("map-container", {
        resizeEnable: true,
        center: [118.90183, 31.892836], // 地图中心点坐标（南京晓庄学院）
        zoom: 14  //缩放级别
      });

      
    //驾车路线规划实例
      this.driving = new AMap.Driving({
        map: this.map,
        panel: "panelContent"  // 指向面板内容区
      });

      // 地点搜索实例
      this.placeSearch = new AMap.PlaceSearch({
        city: '',
        citylimit: false,
        pageSize: 10
      });

      // 初始化定位功能
      this.geolocation = new AMap.Geolocation({
        enableHighAccuracy: true, // 是否使用高精度定位
        timeout: 10000, // 超过10秒后停止定位
        buttonPosition: 'RB', // 定位按钮位置
        buttonOffset: new AMap.Pixel(10, 20), // 定位按钮偏移量
        showMarker: true, // 定位成功后在定位到的位置显示点标记
        showCircle: true, // 定位成功后用圆圈表示定位精度范围
        panToLocation: true, // 定位成功后将定位到的位置作为地图中心点
        zoomToAccuracy: true // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见
      });

      // 将定位功能添加到地图实例
      this.map.addControl(this.geolocation);

      // 绑定定位事件
      this.geolocation.on('complete', (data) => {
        // 定位成功
        console.log('定位成功:', data);
        const { position } = data;
        // 存储当前位置坐标
        this.currentLocation = position;
        // 在页面上显示当前位置信息
        this.showCurrentLocation(position);
      });

      this.geolocation.on('error', (error) => {
        // 定位失败
        console.error('定位失败:', error);
        this.showError('获取当前位置失败，请检查位置权限或稍后重试');
      });

      // 标记地图已初始化
      this.mapInitialized = true;
      // 如果有定位请求在等待，执行定位
      if (this.pendingLocationRequest) {
        this.getCurrentLocation();
        this.pendingLocationRequest = false;
      }
      
      // 初始化面板折叠按钮
      this.initPanelToggle();
    }).catch(error => {
      console.error('地图初始化失败:', error);
      this.showError('地图服务初始化失败，请检查网络连接或稍后重试');
    });
  }

  // 初始化面板折叠功能
  initPanelToggle() {
    const toggleBtn = document.getElementById('panelToggleBtn');
    const panel = document.getElementById('panel');
    
    if (toggleBtn && panel) {
      toggleBtn.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
      });
    }
  }

  // 主路径规划方法
  planRoute(startAddr, endAddr) {
    if (!this.validateInputs(startAddr, endAddr)) return;

    const suggestion = this.generateSuggestions();

    if (!this.driving) {
      this.showError('地图服务尚未准备就绪，请稍候重试');
      return;
    }

    // 执行高德地图路线搜索
    this.driving.search([
      { keyword: startAddr, city: '' },
      { keyword: endAddr, city: '' }
    ], (status, result) => this.handleRouteResult(status, result, startAddr, endAddr, suggestion));
  }



  // 验证输入
  validateInputs(startAddr, endAddr) {
    if (!startAddr || !endAddr) {
      alert('请输入起点和终点地址');
      return false;
    }
    return true;
  }

  // 生成季节和时间建议
  generateSuggestions() {
    const now = new Date();
    const hours = now.getHours();
    const isDaytime = hours >= 6 && hours < 18;
    const month = now.getMonth() + 1;
    const isSummer = month >= 6 && month <= 8;
    const isWinter = month >= 12 || month <= 2;

    let suggestion = '<h3>☁️ 关注天气，以备出行便捷</h3>';

    if (isSummer) {
      suggestion += '<h3>🌞 天气炎热，注意高温防暑</h3><h3>🧴 注意防晒，记得及时补水</h3>';
    } else if (isWinter) {
      suggestion += '<h3>❄️ 天气寒冷，注意防寒保暖</h3><h3>⚠️ 注意路面结冰情况</h3>';
    } else {
      suggestion += '<h3>🌤️ 天气适宜，注意安全驾驶</h3>';
    }

    if (!isDaytime) {
      suggestion += '<h3>🌙 夜间驾驶，请开启车灯，注意安全</h3>';
    }
    return suggestion;
  }

  // 处理路线搜索结果（调用函数计算时间距离、获取路线关键点、搜索充电站）
  handleRouteResult(status, result, startAddr, endAddr, suggestion) {
    if (status === 'complete' && result.routes && result.routes[0]) {
      // 确保#panel显示并展开（高德地图会自动填充路线详情）
      const panel = document.getElementById('panel');
      if (panel) {
        panel.style.display = 'block';
        panel.style.visibility = 'visible';
        panel.classList.remove('collapsed');  // 移除折叠状态
      }
    
      const route = result.routes[0];
      const { distance, timeDisplay } = this.calculateRouteMetrics(route);
      const routePoints = this.getRoutePoints(route);

      this.searchChargingStations(routePoints)
        .then(stations => {
          this.displayResults(startAddr, endAddr, distance, timeDisplay, stations, suggestion);
        })
        .catch(error => {
          console.error('充电站搜索失败:', error);
          this.displayResults(startAddr, endAddr, distance, timeDisplay, [], suggestion, true);
        });
    } else {
      this.showError('路线规划失败，请检查地址是否正确或稍后重试');
    }
  }

  // 计算路线距离和时间
  calculateRouteMetrics(route) {
    const distance = route.distance / 1000; // 公里
    const duration = Math.floor(route.time / 60); // 整数分钟
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    const timeDisplay = hours > 0 
      ? `${hours}小时${minutes > 0 ? `${minutes}分钟` : ''}` 
      : `${minutes}分钟`;

    return { distance, timeDisplay };
  }

  // 获取路线关键点
  getRoutePoints(route) {
    const points = [];

    try {
      // 获取路线的完整路径点
      let pathPoints = [];

      // 从路线规划结果获取路径点
      if (route.steps && route.steps.length > 0) {
        route.steps.forEach(step => {
          if (step.path && step.path.length > 0) {
            pathPoints = pathPoints.concat(step.path);
          } else if (step.start_location && step.end_location) {
            pathPoints.push(step.start_location);
            pathPoints.push(step.end_location);
          }
        });
      }

      if (pathPoints.length > 0) {
        const totalPoints = pathPoints.length;
        const positions = [0, 0.25, 0.5, 0.75, 1]; // 5个固定位置

        positions.forEach(ratio => {
          const index = Math.min(Math.floor(ratio * (totalPoints - 1)), totalPoints - 1);
          const point = pathPoints[index];
          if (point && typeof point.lng === 'number' && typeof point.lat === 'number') {
            points.push([point.lng, point.lat]);
          }
        });

        console.log(`成功获取${points.length}个路线关键点:`, points);
      }
    } catch (error) {
      console.error('获取路线关键点失败:', error);
    }


    return points;
  }

  // 充电站点规划
  async searchChargingStations(routePoints) {

    // 搜索单个点附近的充电站
    const searchNearbyStations = async (point) => {
      return new Promise((resolve) => {
        this.placeSearch.searchNearBy('充电站', point, 3000, (status, result) => {
          if (status === 'complete' && result.poiList?.pois) {
            return resolve(result.poiList.pois);
          }
          resolve([]);
        });
      });
    };

    try {
      // 所有关键点的充电站
      const allResults = await Promise.all(
        routePoints.map(point => searchNearbyStations(point))
      );

      // 合并结果并去重
      const seenKeys = new Set();
      const uniqueStations = [];

      for (const stations of allResults) {
        for (const station of stations) {
          const key = `${station.location.lng.toFixed(4)},${station.location.lat.toFixed(4)}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueStations.push({
              ...station,
              uniqueKey: key
            });
          }
        }
      }

      // 按距离排序并返回
      return uniqueStations.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('规划充电站失败:', error);
      throw error;
    }
  }

  // 显示路线结果
  displayResults(startAddr, endAddr, distance, timeDisplay, stations, suggestion, hasError = false) 
  {
    // 确保#panel显示并展开
    const panel = document.getElementById('panel');
    if (panel) {
      panel.style.display = 'block';
      panel.style.visibility = 'visible';
      panel.classList.remove('collapsed');  // 移除折叠状态
    }
    
    const stationIcon = './markers/charging_station.jpg';

    if (stations.length > 0) {
      // 添加充电站标记
      stations.forEach(station => {
        const marker = new AMap.Marker({
          position: [station.location.lng, station.location.lat],
          icon: new AMap.Icon({
            size: new AMap.Size(30, 30),
            content: `<div style="width: 30px; height: 30px; border-radius: 50%; overflow: hidden; border: 2px solid #00cc66;"><img src="${stationIcon}" style="width: 100%; height: 100%; object-fit: cover;"></div>`,
            imageSize: new AMap.Size(30, 30)
          }),
          title: station.name
        });

        // 添加详细信息弹窗
        const infoWindow = new AMap.InfoWindow({
          content: `<div style="padding: 12px; min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #1890ff;">${station.name}</h4>
            <p style="margin: 4px 0; font-size: 14px;"><strong>地址:</strong> ${station.address}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>距离:</strong> ${(station.distance / 1000).toFixed(1)}公里</p>
          </div>`
        });

        marker.on('click', () => infoWindow.open(this.map, marker.getPosition()));
        marker.setMap(this.map);
      });
    }

    // 使用统一的配送小贴士显示
    this.showUnifiedDeliveryTips(distance, timeDisplay);
  }

  // 显示错误信息
  showError(message) {
    document.getElementById('routeSuggestion').innerHTML = 
      `<h3>路线规划失败</h3><p>${message}</p>`;
  }
  
  // 统一的配送小贴士显示方法
  showUnifiedDeliveryTips(distance, timeDisplay) {
    console.log('%c⚡ 调用 showUnifiedDeliveryTips - 单卡片结构', 'color: #10b981; font-weight: bold;');
    
    // 配送小贴士模板（固定3个核心提示）
    const deliveryTips = [
      {
        icon: '🚗',
        title: '安全驾驶提醒',
        tips: [
          '请系好安全带，确保驾驶安全',
          '保持距前车安全距离，注意观察路况',
          '遵守交通规则，安全第一'
        ]
      },
      {
        icon: '🌤️',
        title: '天气温馨提示',
        tips: [
          '当前天气晴好，适宜配送出行',
          '注意防晒防暑，多喝水保持体力',
          '记得随身携带雨具，预防天气突变'
        ]
      },
      {
        icon: '⚡',
        title: '节能环保建议',
        tips: [
          '建议平稳驾驶，可提升20%续航里程',
          '避免频繁加速减速，节省电量消耗',
          '合理规划路线，减少空驶距离'
        ]
      },
      {
        icon: '✨',
        title: '服务礼仪提示',
        tips: [
          '微笑服务，让客户感受温暖',
          '轻拿轻放，尊重每一份物品',
          '准时送达，守信用是最好的服务'
        ]
      },
      {
        icon: '🔋',
        title: '充电规划建议',
        tips: [
          '建议在电量低于20%前寻找充电桶',
          '附近充电站已在地图上标注，可提前规划',
          `充电时间约需${Math.ceil(distance / 10 * 15)}分钟，可合理安排`
        ]
      },
      {
        icon: '🎯',
        title: '路线规划小贴士',
        tips: [
          `本次行程约${distance.toFixed(1)}公里，预计${timeDisplay}`,
          '已为您规划最优路线，请按地图导航行驶',
          '建议提前5分钟出发，留出充裕时间'
        ]
      }
    ];
    
    // 随机选择一组提示
    const selectedTip = deliveryTips[Math.floor(Math.random() * deliveryTips.length)];
    
    const infoHtml = `
        <h4 style="
          margin: 0 0 var(--space-lg) 0;
          color: var(--primary-blue);
          font-size: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        ">
          <span style="font-size: 1rem;">${selectedTip.icon}</span>
          ${selectedTip.title}
        </h4>
        ${selectedTip.tips.map((tip, index) => `
          <div style="
            display: flex;
            align-items: flex-start;
            gap: var(--space-sm);
            margin-bottom: var(--space-sm);
          ">
            <span style="
              color: var(--primary-blue);
              font-weight: 700;
              font-size: 0.8rem;
              flex-shrink: 0;
              margin-top: 2px;
            ">${index + 1}.</span>
            <span style="
              color: var(--text-dark);
              font-size: 0.8rem;
              line-height: 1.2;
            ">${tip}</span>
          </div>
        `).join('')}
        <div style="
          margin-top: var(--space-md);
          padding-top: var(--space-md);
          border-top: 1px solid rgba(10, 108, 255, 0.1);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        ">
          <span style="font-size: 16px;">💡</span>
          <span style="
            font-size: var(--text-xs);
            color: var(--text-gray-dark);
            font-weight: 500;
          ">祝您配送顺利，一路平安！</span>
        </div>
     
    `;
    
    // 将温馨提示显示到路线建议区域
    const routeSuggestion = document.getElementById('routeSuggestion');
    if (routeSuggestion) {
      routeSuggestion.innerHTML = infoHtml;
    }
  }

  // 显示当前位置信息（更新第7个轮播项并切换）
  showCurrentLocation(position) {
    // 逆地理编码，将经纬度转换为地址信息
    AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new AMap.Geocoder();
      geocoder.getAddress([position.lng, position.lat], (status, result) => {
        let simplifiedAddress = '当前位置附近';
        let fullAddress = '';
        
        if (status === 'complete' && result.regeocode) {
          fullAddress = result.regeocode.formattedAddress;
          
          // 提取简化地址（仅显示城市+区域）
          if (result.regeocode.addressComponent) {
            const { city, district } = result.regeocode.addressComponent;
            simplifiedAddress = `${city || ''}${district || ''}附近`;
          } else {
            // 如果无法获取组件，尝试从完整地址中提取
            const match = fullAddress.match(/^([^省市]+[省市])?([^区县]+[区县])/);
            simplifiedAddress = match ? match[0] + '附近' : '当前位置附近';
          }
          
          // 填充起点输入框（使用完整地址）
          const startAddrInput = document.getElementById('startAddr');
          if (startAddrInput) {
            startAddrInput.value = fullAddress;
          }
        }
        
        // 更新第7个轮播项的内容
        const locationTipItem = document.getElementById('locationTipItem');
        if (locationTipItem) {
          const iconSpan = locationTipItem.querySelector('.tip-icon');
          const contentDiv = locationTipItem.querySelector('.tip-content');
          
          if (iconSpan && contentDiv) {
            iconSpan.textContent = '🧭';
            
            if (status === 'complete' && result.regeocode) {
              // 定位成功
              contentDiv.innerHTML = `
                <h3>定位成功</h3>
                <p style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  margin: 8px 0;
                  padding: 8px 12px;
                  background: linear-gradient(135deg, rgba(10, 108, 255, 0.08), rgba(59, 130, 246, 0.05));
                  border-radius: 8px;
                  border: 1px solid rgba(10, 108, 255, 0.15);
                ">
                  <span style="font-size: 18px;">📍</span>
                  <span style="font-weight: 600; color: var(--text-dark);">${simplifiedAddress}</span>
                </p>
                <p style="
                  font-size: 14px;
                  color: var(--text-gray-dark);
                  margin: 8px 0 0 0;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                ">
                  <span>💡</span>
                  <span>可将此位置设为起点</span>
                </p>
              `;
            } else {
              // 定位部分成功（仅有坐标）
              contentDiv.innerHTML = `
                <h3>定位成功</h3>
                <p style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  margin: 8px 0;
                  padding: 8px 12px;
                  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
                  border-radius: 8px;
                  border: 1px solid rgba(245, 158, 11, 0.2);
                ">
                  <span style="font-size: 18px;">⚠️</span>
                  <span style="font-weight: 600; color: var(--text-dark);">已获取坐标，无法获取地址</span>
                </p>
                <p style="
                  font-size: 14px;
                  color: var(--text-gray-dark);
                  margin: 8px 0 0 0;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                ">
                  <span>💡</span>
                  <span>请手动输入起点地址</span>
                </p>
              `;
            }
          }
        }
        
        // 自动切换到第7个轮播项（索引6）
        if (window.tipsCarousel) {
          window.tipsCarousel.goToSlide(6);
        }
      });
    });
  }

  // 手动触发定位
  getCurrentLocation() {
    // 检查地图是否已初始化
    if (this.mapInitialized) {
      this.geolocation.getCurrentPosition();
    } else {
      // 如果地图未初始化，标记有定位请求等待
      this.pendingLocationRequest = true;
    }
  }
}



// 路径规划触发函数
function planRoute() {
  const startAddr = document.getElementById('startAddr').value;
  const endAddr = document.getElementById('endAddr').value;
  window.routePlanner.planRoute(startAddr, endAddr);
}



// 页面加载完成后初始化
window.onload = function() {
  try {
    console.log('window.onload triggered');
    // 性能监控 - 记录页面加载时间
    const loadStartTime = performance.now();
    
    // 初始化用户状态显示
    updateUserStatus();
    
    // 初始化RoutePlanner
    window.routePlanner = new RoutePlanner();
    
    // 页面加载完成后自动获取当前位置
    if (window.routePlanner && typeof window.routePlanner.getCurrentLocation === 'function') {
      window.routePlanner.getCurrentLocation();
    }
    
    // 初始化配送任务
    if (typeof initDeliveryTasks === 'function') {
      initDeliveryTasks();
    }
    
    // 绑定规划路线按钮事件
    const planRouteBtn = document.getElementById('planRouteBtn');
    if (planRouteBtn && typeof planRoute === 'function') {
      planRouteBtn.addEventListener('click', planRoute);
    }
    
    // 初始化装饰元素动画
    if (typeof initDecorativeElements === 'function') {
      initDecorativeElements();
    }
    
    // 初始化用户状态界面（重要：确保遮罩层正确显示）
    console.log('Before userStatusManager.updateUI()');
    console.log('userStatusManager object:', userStatusManager);
    if (userStatusManager && typeof userStatusManager.updateUI === 'function') {
      console.log('Calling userStatusManager.updateUI()');
      userStatusManager.updateUI();
    } else {
      console.error('userStatusManager not available or updateUI not a function');
    }
    
    // 性能监控 - 记录页面加载完成时间
    const loadEndTime = performance.now();
    console.log(`页面加载完成时间: ${(loadEndTime - loadStartTime).toFixed(2)}ms`);
    
    // 添加性能监控
    if (typeof setupPerformanceMonitoring === 'function') {
      setupPerformanceMonitoring();
    }
  } catch (error) {
    console.error('页面初始化失败:', error);
    // 显示友好的错误提示
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      text-align: center;
    `;
    errorMessage.innerHTML = `
      <h3 style="color: #ff4d4f; margin-bottom: 10px;">页面初始化失败</h3>
      <p style="margin-bottom: 15px; color: #666;">请刷新页面重试</p>
      <button onclick="location.reload()" style="background: #1890ff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
        刷新页面
      </button>
    `;
    document.body.appendChild(errorMessage);
  }
};

// ==================== 管理员功能模块 ====================

/**
 * 检查当前用户是否为管理员，并显示管理员界面元素
 */
function checkAdminRole() {
  let userData = sessionStorage.getItem('currentUser');
  if (!userData) {
    userData = localStorage.getItem('currentUser');
  }
  
  // 默认隐藏所有管理员元素
  hideAdminElements();
  
  if (userData) {
    try {
      const storedData = JSON.parse(userData);
      const currentUser = storedData.user || storedData;
      
      if (currentUser && currentUser.role === 'ADMIN') {
        // 显示所有管理员界面元素
        showAdminElements();
        console.log('管理员模式已启用');
        return true;
      }
    } catch (e) {
      console.error('解析用户数据失败:', e);
    }
  }
  
  return false;
}

/**
 * 显示管理员界面元素
 */
function showAdminElements() {
  // 给 body 添加管理员模式标识
  document.body.classList.add('admin-mode');
  
  // 显示左侧导航栏管理员菜单
  const adminMenu = document.getElementById('adminMenuSection');
  if (adminMenu) {
    adminMenu.style.display = 'block';
  }
  
  // 显示管理员角色徽章
  const adminBadge = document.getElementById('adminBadge');
  if (adminBadge) {
    adminBadge.style.display = 'inline-flex';
  }
  
  // 显示管理员快捷菜单
  const adminQuickMenu = document.getElementById('adminQuickMenu');
  if (adminQuickMenu) {
    adminQuickMenu.style.display = 'block';
  }
  
  // 显示管理员任务操作栏
  const adminTaskActions = document.getElementById('adminTaskActions');
  if (adminTaskActions) {
    adminTaskActions.style.display = 'flex';
  }
}

/**
 * 隐藏管理员界面元素
 */
function hideAdminElements() {
  // 移除 body 的管理员模式标识
  document.body.classList.remove('admin-mode');
  
  // 隐藏左侧导航栏管理员菜单
  const adminMenu = document.getElementById('adminMenuSection');
  if (adminMenu) {
    adminMenu.style.display = 'none';
  }
  
  // 隐藏管理员角色徽章
  const adminBadge = document.getElementById('adminBadge');
  if (adminBadge) {
    adminBadge.style.display = 'none';
  }
  
  // 隐藏管理员快捷菜单
  const adminQuickMenu = document.getElementById('adminQuickMenu');
  if (adminQuickMenu) {
    adminQuickMenu.style.display = 'none';
  }
  
  // 隐藏管理员任务操作栏
  const adminTaskActions = document.getElementById('adminTaskActions');
  if (adminTaskActions) {
    adminTaskActions.style.display = 'none';
  }
}

/**
 * 切换任务视图（管理员查看所有用户任务/仅查看自己任务）
 */
function toggleTaskView() {
  const toggle = document.getElementById('viewAllTasksToggle');
  const viewAll = toggle ? toggle.checked : false;
  
  // 更新全局标志
  window.adminViewAllTasks = viewAll;
  
  console.log('切换任务视图:', viewAll ? '查看所有用户任务' : '仅查看自己任务');
  
  // 调用 deliveryTaskManager 的 loadDeliveryTasks 方法
  if (typeof deliveryTaskManager !== 'undefined' && deliveryTaskManager.loadDeliveryTasks) {
    deliveryTaskManager.loadDeliveryTasks(viewAll);
  } else {
    console.error('deliveryTaskManager 未定义或无法加载任务');
  }
}

/**
 * 打开管理员控制面板
 */
function openAdminPanel(panelType) {
  const modal = document.getElementById('adminModal');
  const modalTitle = document.getElementById('adminModalTitle');
  const modalBody = document.getElementById('adminModalBody');
  
  if (!modal || !modalTitle || !modalBody) {
    console.error('管理员弹窗元素不存在');
    return;
  }
  
  // 根据类型加载不同内容
  switch (panelType) {
    case 'users':
      modalTitle.textContent = '用户管理';
      loadUserManagement(modalBody);
      break;
    case 'tasks':
      modalTitle.textContent = '任务管理';
      loadTaskManagement(modalBody);
      break;
    case 'dashboard':
      modalTitle.textContent = '数据看板';
      loadDashboard(modalBody);
      break;
    default:
      modalTitle.textContent = '管理员控制台';
      modalBody.innerHTML = '<p>请选择操作类型</p>';
  }
  
  modal.style.display = 'flex';
}

/**
 * 关闭管理员控制面板
 */
function closeAdminPanel() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * 加载用户管理界面
 */
async function loadUserManagement(container) {
  container.innerHTML = '<div class="loading">加载中...</div>';
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/user/list', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json();
    
    if (result.code === 200) {
      const users = result.data;
      container.innerHTML = `
        <div class="admin-table-container">
          <div class="admin-table-header">
            <h3>用户列表 (共 ${users.length} 人)</h3>
            <button class="admin-btn primary" onclick="showAddUserForm()">添加用户</button>
          </div>
          <table class="admin-table">
            <thead>
              <tr>
                <th>用户ID</th>
                <th>用户名</th>
                <th>手机号</th>
                <th>姓名</th>
                <th>角色</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(user => `
                <tr>
                  <td>${user.id}</td>
                  <td>${user.username || '-'}</td>
                  <td>${user.phone || '-'}</td>
                  <td>${user.name || '-'}</td>
                  <td><span class="role-badge ${user.role === 'ADMIN' ? 'admin' : 'user'}">${user.role === 'ADMIN' ? '管理员' : '普通用户'}</span></td>
                  <td><span class="status-badge ${user.status === 1 ? 'active' : 'pending'}">${user.status === 1 ? '正常' : '禁用'}</span></td>
                  <td>
                    ${user.role !== 'ADMIN' ? `
                      <button class="action-btn edit" onclick="showEditUserForm('${user.id}')">编辑</button>
                      <button class="action-btn" onclick="showResetPasswordForm('${user.id}')">重置密码</button>
                      <button class="action-btn delete" onclick="deleteUser('${user.id}')">删除</button>
                    ` : '<span style="color: #999;">不可操作</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      container.innerHTML = `<div class="error">加载失败: ${result.message}</div>`;
    }
  } catch (error) {
    console.error('加载用户列表失败:', error);
    container.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
  }
}

/**
 * 加载任务管理界面
 */
async function loadTaskManagement(container) {
  container.innerHTML = '<div class="loading">加载中...</div>';
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/task/list', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json();
    
    if (result.code === 200) {
      const tasks = result.data;
      container.innerHTML = `
        <div class="admin-table-container">
          <div class="admin-table-header">
            <h3>任务列表 (共 ${tasks.length} 个)</h3>
            <button class="admin-btn primary" onclick="showAddTaskForm()">添加任务</button>
          </div>
          <table class="admin-table">
            <thead>
              <tr>
                <th>任务ID</th>
                <th>行程</th>
                <th>里程</th>
                <th>状态</th>
                <th>分配用户</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.map(task => `
                <tr>
                  <td>${task.id}</td>
                  <td>${task.itinerary || (task.startAddr + ' -> ' + task.endAddr)}</td>
                  <td>${task.mileage ? task.mileage.toFixed(1) + ' km' : '-'}</td>
                  <td><span class="status-badge ${getStatusClass(task.status)}">${task.status}</span></td>
                  <td>${task.userId || '未分配'}</td>
                  <td>
                    <button class="action-btn edit" onclick="showEditTaskForm('${task.id}')">编辑</button>
                    <button class="action-btn edit" onclick="showAssignTaskForm('${task.id}')">分配</button>
                    ${task.status !== '配送中' ? `<button class="action-btn delete" onclick="deleteTask('${task.id}')">删除</button>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      container.innerHTML = `<div class="error">加载失败: ${result.message}</div>`;
    }
  } catch (error) {
    console.error('加载任务列表失败:', error);
    container.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
  }
}

/**
 * 加载数据看板
 */
async function loadDashboard(container) {
  container.innerHTML = '<div class="loading">加载中...</div>';
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json();
    
    if (result.code === 200) {
      const data = result.data;
      container.innerHTML = `
        <div class="admin-stats-grid">
          <div class="admin-stat-card">
            <div class="stat-value">${data.totalUsers}</div>
            <div class="stat-label">总用户数</div>
          </div>
          <div class="admin-stat-card">
            <div class="stat-value">${data.adminCount}</div>
            <div class="stat-label">管理员数</div>
          </div>
          <div class="admin-stat-card">
            <div class="stat-value">${data.totalTasks}</div>
            <div class="stat-label">总任务数</div>
          </div>
          <div class="admin-stat-card pending-card">
            <div class="stat-value">${data.pendingTasks}</div>
            <div class="stat-label">待配送</div>
          </div>
          <div class="admin-stat-card active-card">
            <div class="stat-value">${data.activeTasks}</div>
            <div class="stat-label">配送中</div>
          </div>
          <div class="admin-stat-card completed-card">
            <div class="stat-value">${data.completedTasks}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        <div class="admin-dashboard-actions">
          <h4>快捷操作</h4>
          <div class="action-buttons">
            <button class="admin-btn" onclick="openAdminPanel('users')">用户管理</button>
            <button class="admin-btn" onclick="openAdminPanel('tasks')">任务管理</button>
            <button class="admin-btn" onclick="loadDashboard(document.getElementById('adminModalBody'))">刷新数据</button>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `<div class="error">加载失败: ${result.message}</div>`;
    }
  } catch (error) {
    console.error('加载数据看板失败:', error);
    container.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
  }
}

/**
 * 获取状态样式类
 */
function getStatusClass(status) {
  switch (status) {
    case '待配送': return 'pending';
    case '配送中': return 'active';
    case '配送完成': return 'completed';
    default: return '';
  }
}

/**
 * 显示添加用户表单
 */
function showAddUserForm() {
  const modalBody = document.getElementById('adminModalBody');
  modalBody.innerHTML = `
    <div class="admin-form">
      <h3>添加新用户</h3>
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>手机号 *</label>
          <input type="text" id="newUserPhone" placeholder="请输入手机号">
        </div>
        <div class="admin-form-group">
          <label>密码 *</label>
          <input type="password" id="newUserPassword" placeholder="请输入密码">
        </div>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>用户名</label>
          <input type="text" id="newUserUsername" placeholder="可选，默认使用手机号">
        </div>
        <div class="admin-form-group">
          <label>姓名</label>
          <input type="text" id="newUserName" placeholder="可选">
        </div>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>角色</label>
          <select id="newUserRole">
            <option value="USER">普通用户</option>
            <option value="ADMIN">管理员</option>
          </select>
        </div>
      </div>
      <div style="display: flex; gap: 12px; margin-top: 20px;">
        <button class="admin-btn primary" onclick="submitAddUser()">确认添加</button>
        <button class="admin-btn secondary" onclick="openAdminPanel('users')">返回列表</button>
      </div>
    </div>
  `;
}

/**
 * 提交添加用户
 */
async function submitAddUser() {
  const phone = document.getElementById('newUserPhone').value.trim();
  const password = document.getElementById('newUserPassword').value;
  const username = document.getElementById('newUserUsername').value.trim();
  const name = document.getElementById('newUserName').value.trim();
  const role = document.getElementById('newUserRole').value;
  
  if (!phone || !password) {
    alert('手机号和密码不能为空');
    return;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/user/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone, password, username, name, role })
    });
    const result = await response.json();
    
    if (result.code === 200) {
      alert('用户添加成功');
      openAdminPanel('users');
    } else {
      alert('添加失败: ' + result.message);
    }
  } catch (error) {
    console.error('添加用户失败:', error);
    alert('添加失败: ' + error.message);
  }
}

/**
 * 删除用户
 */
async function deleteUser(userId) {
  if (!confirm('确定要删除该用户吗？')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/admin/user/delete/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    
    if (result.code === 200) {
      alert('用户删除成功');
      openAdminPanel('users');
    } else {
      alert('删除失败: ' + result.message);
    }
  } catch (error) {
    console.error('删除用户失败:', error);
    alert('删除失败: ' + error.message);
  }
}

/**
 * 显示添加任务表单
 */
function showAddTaskForm() {
  const modalBody = document.getElementById('adminModalBody');
  modalBody.innerHTML = `
    <div class="admin-form">
      <h3>添加配送任务</h3>
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>起点地址 *</label>
          <input type="text" id="newTaskStartAddr" placeholder="请输入起点地址" oninput="calculateRouteForIndex()">
        </div>
        <div class="admin-form-group">
          <label>终点地址 *</label>
          <input type="text" id="newTaskEndAddr" placeholder="请输入终点地址" oninput="calculateRouteForIndex()">
        </div>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>预计里程 (km)</label>
          <input type="number" id="newTaskMileage" placeholder="系统自动计算" readonly>
          <small style="color: #999; font-size: 0.8em;">输入地址后自动计算</small>
        </div>
        <div class="admin-form-group">
          <label>预计耗电 (kWh)</label>
          <input type="number" id="newTaskPowerUsage" placeholder="系统自动计算" readonly>
          <small style="color: #999; font-size: 0.8em;">基于里程自动估算</small>
        </div>
      </div>
      <div style="display: flex; gap: 12px; margin-top: 20px;">
        <button class="admin-btn primary" onclick="submitAddTask()">确认添加</button>
        <button class="admin-btn secondary" onclick="openAdminPanel('tasks')">返回列表</button>
      </div>
    </div>
  `;
}

/**
 * 为首页表单计算路线
 */
async function calculateRouteForIndex() {
  const startAddr = document.getElementById('newTaskStartAddr').value.trim();
  const endAddr = document.getElementById('newTaskEndAddr').value.trim();
  
  if (startAddr && endAddr) {
    try {
      // 显示加载状态
      const mileageInput = document.getElementById('newTaskMileage');
      const powerUsageInput = document.getElementById('newTaskPowerUsage');
      
      if (mileageInput) {
        mileageInput.placeholder = '计算中...';
        mileageInput.value = '';
      }
      if (powerUsageInput) {
        powerUsageInput.placeholder = '计算中...';
        powerUsageInput.value = '';
      }
      
      // 调用后端路线规划API
      const token = localStorage.getItem('authToken');
      // 确保中文字符正确编码
      const response = await fetch('/api/route/calculate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
          startAddr: encodeURIComponent(startAddr),
          endAddr: encodeURIComponent(endAddr)
        })
      });
      
      const result = await response.json();
      
      if (result.code === 200 && result.data) {
        const distance = result.data.distance; // 公里
        const duration = result.data.duration; // 分钟
        
        // 基于距离估算耗电量
        const powerUsage = distance * POWER_CONSUMPTION_RATE;
        
        if (mileageInput) {
          mileageInput.value = distance.toFixed(2);
          mileageInput.placeholder = '系统自动计算';
        }
        if (powerUsageInput) {
          powerUsageInput.value = powerUsage.toFixed(2);
          powerUsageInput.placeholder = '系统自动计算';
        }
        
        // 保存时间信息到全局变量，供提交任务时使用
        window.lastCalculatedDuration = duration;
      } else {
        console.error('路线计算失败:', result.message);
        const mileageInput = document.getElementById('newTaskMileage');
        const powerUsageInput = document.getElementById('newTaskPowerUsage');
        if (mileageInput) mileageInput.placeholder = '系统自动计算';
        if (powerUsageInput) powerUsageInput.placeholder = '系统自动计算';
      }
    } catch (error) {
      console.error('路线计算失败:', error);
      const mileageInput = document.getElementById('newTaskMileage');
      const powerUsageInput = document.getElementById('newTaskPowerUsage');
      if (mileageInput) mileageInput.placeholder = '系统自动计算';
      if (powerUsageInput) powerUsageInput.placeholder = '系统自动计算';
    }
  }
}

/**
 * 提交添加任务
 */
async function submitAddTask() {
  const startAddr = document.getElementById('newTaskStartAddr').value.trim();
  const endAddr = document.getElementById('newTaskEndAddr').value.trim();
  const mileage = document.getElementById('newTaskMileage').value;
  const powerUsage = document.getElementById('newTaskPowerUsage').value;
  
  if (!startAddr || !endAddr) {
    alert('起点和终点地址不能为空');
    return;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/task/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startAddr,
        endAddr,
        mileage: mileage !== undefined && mileage !== null && mileage !== '' ? parseFloat(mileage) : null,
        energy: powerUsage !== undefined && powerUsage !== null && powerUsage !== '' ? parseFloat(powerUsage) : null,
        time: window.lastCalculatedDuration !== undefined && window.lastCalculatedDuration !== null && window.lastCalculatedDuration !== '' ? parseInt(window.lastCalculatedDuration) : null,
        itinerary: `${startAddr} → ${endAddr}`,
        status: '待配送'
      })
    });
    const result = await response.json();
    
    if (result.code === 200) {
      alert('任务添加成功');
      openAdminPanel('tasks');
    } else {
      alert('添加失败: ' + result.message);
    }
  } catch (error) {
    console.error('添加任务失败:', error);
    alert('添加失败: ' + error.message);
  }
}

/**
 * 显示分配任务表单
 */
async function showAssignTaskForm(taskId) {
  const modalBody = document.getElementById('adminModalBody');
  modalBody.innerHTML = '<div class="loading">加载用户列表...</div>';
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/user/list', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    
    if (result.code === 200) {
      const users = result.data.filter(u => u.role !== 'ADMIN');
      modalBody.innerHTML = `
        <div class="admin-form">
          <h3>分配任务</h3>
          <p>任务ID: ${taskId}</p>
          <div class="admin-form-group">
            <label>选择用户</label>
            <select id="assignUserId">
              <option value="">请选择用户</option>
              ${users.map(u => `<option value="${u.id}">${u.username} (${u.name || u.phone})</option>`).join('')}
            </select>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button class="admin-btn primary" onclick="submitAssignTask('${taskId}')">确认分配</button>
            <button class="admin-btn secondary" onclick="openAdminPanel('tasks')">返回列表</button>
          </div>
        </div>
      `;
    } else {
      modalBody.innerHTML = `<div class="error">加载用户列表失败</div>`;
    }
  } catch (error) {
    console.error('加载用户列表失败:', error);
    modalBody.innerHTML = `<div class="error">加载失败</div>`;
  }
}

/**
 * 提交分配任务
 */
async function submitAssignTask(taskId) {
  const userId = document.getElementById('assignUserId').value;
  
  if (!userId) {
    alert('请选择要分配的用户');
    return;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/admin/task/assign?taskId=${taskId}&userId=${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    
    if (result.code === 200) {
      alert('任务分配成功');
      openAdminPanel('tasks');
    } else {
      alert('分配失败: ' + result.message);
    }
  } catch (error) {
    console.error('分配任务失败:', error);
    alert('分配失败: ' + error.message);
  }
}

/**
 * 删除任务
 */
async function deleteTask(taskId) {
  if (!confirm('确定要删除该任务吗？')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/admin/task/delete/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    
    if (result.code === 200) {
      alert('任务删除成功');
      openAdminPanel('tasks');
    } else {
      alert('删除失败: ' + result.message);
    }
  } catch (error) {
    console.error('删除任务失败:', error);
    alert('删除失败: ' + error.message);
  }
}

/**
 * 显示编辑用户表单
 */
async function showEditUserForm(userId) {
  const modalBody = document.getElementById('adminModalBody');
  modalBody.innerHTML = '<div class="loading">加载用户信息...</div>';
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/user/get/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    
    if (result.code === 200) {
      const user = result.data;
      modalBody.innerHTML = `
        <div class="admin-form">
          <h3>编辑用户信息</h3>
          <input type="hidden" id="editUserId" value="${user.id}">
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>用户ID</label>
              <input type="text" value="${user.id}" disabled>
            </div>
            <div class="admin-form-group">
              <label>手机号</label>
              <input type="text" id="editUserPhone" value="${user.phone || ''}">
            </div>
          </div>
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>用户名</label>
              <input type="text" id="editUserUsername" value="${user.username || ''}">
            </div>
            <div class="admin-form-group">
              <label>姓名</label>
              <input type="text" id="editUserName" value="${user.name || ''}">
            </div>
          </div>
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>角色</label>
              <select id="editUserRole">
                <option value="USER" ${user.role !== 'ADMIN' ? 'selected' : ''}>普通用户</option>
                <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>管理员</option>
              </select>
            </div>
            <div class="admin-form-group">
              <label>状态</label>
              <select id="editUserStatus">
                <option value="1" ${user.status === 1 ? 'selected' : ''}>正常</option>
                <option value="0" ${user.status !== 1 ? 'selected' : ''}>禁用</option>
              </select>
            </div>
          </div>
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>新密码 (留空不修改)</label>
              <input type="password" id="editUserPassword" placeholder="留空不修改密码">
            </div>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button class="admin-btn primary" onclick="submitEditUser()">保存修改</button>
            <button class="admin-btn secondary" onclick="openAdminPanel('users')">返回列表</button>
          </div>
        </div>
      `;
    } else {
      modalBody.innerHTML = `<div class="error">加载用户信息失败: ${result.message}</div>`;
    }
  } catch (error) {
    console.error('加载用户信息失败:', error);
    modalBody.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
  }
}

/**
 * 提交编辑用户
 */
async function submitEditUser() {
  const userId = document.getElementById('editUserId').value;
  const phone = document.getElementById('editUserPhone').value.trim();
  const username = document.getElementById('editUserUsername').value.trim();
  const name = document.getElementById('editUserName').value.trim();
  const role = document.getElementById('editUserRole').value;
  const status = parseInt(document.getElementById('editUserStatus').value);
  const password = document.getElementById('editUserPassword').value;
  
  try {
    const token = localStorage.getItem('authToken');
    const userData = { id: userId, phone, username, name, role, status };
    if (password) {
      userData.password = password;
    }
    
    const response = await fetch('/api/admin/user/update', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    const result = await response.json();
    
    if (result.code === 200) {
      alert('用户信息修改成功');
      openAdminPanel('users');
    } else {
      alert('修改失败: ' + result.message);
    }
  } catch (error) {
    console.error('修改用户失败:', error);
    alert('修改失败: ' + error.message);
  }
}

/**
 * 显示重置密码表单（管理员功能）
 */
function showResetPasswordForm(userId) {
  const modalBody = document.getElementById('adminModalBody');
  modalBody.innerHTML = `
    <div class="admin-form">
      <h3>重置用户密码</h3>
      <input type="hidden" id="resetPasswordUserId" value="${userId}">
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>用户ID</label>
          <input type="text" value="${userId}" disabled>
        </div>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>新密码 *</label>
          <input type="password" id="resetNewPassword" placeholder="请输入新密码">
        </div>
        <div class="admin-form-group">
          <label>确认密码 *</label>
          <input type="password" id="resetConfirmPassword" placeholder="请再次输入新密码">
        </div>
      </div>
      <div style="display: flex; gap: 12px; margin-top: 20px;">
        <button class="admin-btn primary" onclick="submitResetPassword()">确认重置</button>
        <button class="admin-btn secondary" onclick="openAdminPanel('users')">返回列表</button>
      </div>
    </div>
  `;
}

/**
 * 提交重置密码（管理员功能）
 */
async function submitResetPassword() {
  const userId = document.getElementById('resetPasswordUserId').value;
  const newPassword = document.getElementById('resetNewPassword').value;
  const confirmPassword = document.getElementById('resetConfirmPassword').value;
  
  if (!newPassword) {
    alert('请输入新密码');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    alert('两次输入的密码不一致');
    return;
  }
  
  if (newPassword.length < 6) {
    alert('密码长度不能少于6位');
    return;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/admin/user/resetPassword/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: newPassword })
    });
    const result = await response.json();
    
    if (result.code === 200) {
      alert('密码重置成功');
      openAdminPanel('users');
    } else {
      alert('重置失败: ' + result.message);
    }
  } catch (error) {
    console.error('重置密码失败:', error);
    alert('重置失败: ' + error.message);
  }
}

/**
 * 显示编辑任务表单
 */
async function showEditTaskForm(taskId) {
  const modalBody = document.getElementById('adminModalBody');
  modalBody.innerHTML = '<div class="loading">加载任务信息...</div>';
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/admin/task/get/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    
    if (result.code === 200) {
      const task = result.data;
      modalBody.innerHTML = `
        <div class="admin-form">
          <h3>编辑配送任务</h3>
          <input type="hidden" id="editTaskId" value="${task.id}">
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>任务ID</label>
              <input type="text" value="${task.id}" disabled>
            </div>
            <div class="admin-form-group">
              <label>状态</label>
              <select id="editTaskStatus">
                <option value="待配送" ${task.status === '待配送' ? 'selected' : ''}>待配送</option>
                <option value="配送中" ${task.status === '配送中' ? 'selected' : ''}>配送中</option>
                <option value="配送完成" ${task.status === '配送完成' ? 'selected' : ''}>配送完成</option>
              </select>
            </div>
          </div>
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>起点地址 *</label>
              <input type="text" id="editTaskStartAddr" value="${task.startAddr || ''}">
            </div>
            <div class="admin-form-group">
              <label>终点地址 *</label>
              <input type="text" id="editTaskEndAddr" value="${task.endAddr || ''}">
            </div>
          </div>
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label>预计里程 (km)</label>
              <input type="number" id="editTaskMileage" value="${task.mileage || ''}">
            </div>
            <div class="admin-form-group">
              <label>预计时间 (分钟)</label>
              <input type="number" id="editTaskTime" value="${task.time || ''}">
            </div>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button class="admin-btn primary" onclick="submitEditTask()">保存修改</button>
            <button class="admin-btn secondary" onclick="openAdminPanel('tasks')">返回列表</button>
          </div>
        </div>
      `;
    } else {
      modalBody.innerHTML = `<div class="error">加载任务信息失败: ${result.message}</div>`;
    }
  } catch (error) {
    console.error('加载任务信息失败:', error);
    modalBody.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
  }
}

/**
 * 提交编辑任务
 */
async function submitEditTask() {
  const taskId = document.getElementById('editTaskId').value;
  const status = document.getElementById('editTaskStatus').value;
  const startAddr = document.getElementById('editTaskStartAddr').value.trim();
  const endAddr = document.getElementById('editTaskEndAddr').value.trim();
  const mileage = document.getElementById('editTaskMileage').value;
  const time = document.getElementById('editTaskTime').value;
  
  if (!startAddr || !endAddr) {
    alert('起点和终点地址不能为空');
    return;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/task/update', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: taskId,
        status,
        startAddr,
        endAddr,
        mileage: mileage ? parseFloat(mileage) : null,
        time: time ? parseInt(time) : null,
        itinerary: startAddr + ' -> ' + endAddr
      })
    });
    const result = await response.json();
    
    if (result.code === 200) {
      alert('任务修改成功');
      openAdminPanel('tasks');
    } else {
      alert('修改失败: ' + result.message);
    }
  } catch (error) {
    console.error('修改任务失败:', error);
    alert('修改失败: ' + error.message);
  }
}

// 页面加载时检查管理员角色
document.addEventListener('DOMContentLoaded', function() {
  // 延迟执行以确保用户数据已加载
  setTimeout(checkAdminRole, 500);
});

// 点击弹窗外部关闭
document.addEventListener('click', function(e) {
  const modal = document.getElementById('adminModal');
  if (e.target === modal) {
    closeAdminPanel();
  }
});

// 处理左侧导航栏链接，动态添加用户 ID 参数
document.addEventListener('DOMContentLoaded', function() {
  const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-item');
  sidebarLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes('profile.html')) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        // 获取当前用户
        let userData = sessionStorage.getItem('currentUser');
        if (!userData) {
          userData = localStorage.getItem('currentUser');
        }
        if (userData) {
          const storedData = JSON.parse(userData);
          const currentUser = storedData.user || storedData;
          if (currentUser && currentUser.id) {
            // 添加用户 ID 参数
            const url = new URL(href, window.location.origin);
            url.searchParams.set('userId', currentUser.id);
            window.location.href = url.toString();
            return;
          }
        }
        // 未登录时跳转到登录页
        window.location.href = '/html/login.html';
      });
    }
  });
});

// 更新用户状态显示
function updateUserStatus() {
  try {
    // 从 sessionStorage 获取当前用户信息
    const currentUserData = sessionStorage.getItem('currentUser');
    
    const userStatus = document.getElementById('userStatus');
    const authNav = document.getElementById('authNav');
    const profileNav = document.getElementById('profileNav');
    
    if (currentUserData) {
      // 用户已登录 - 兼容 {user, token} 格式
      const storedData = JSON.parse(currentUserData);
      const currentUser = storedData.user || storedData;
      console.log('当前用户完整数据:', currentUser);
      
      // 隐藏登录/注册按钮，显示用户信息
      if (authNav) authNav.style.display = 'none';
      if (profileNav) profileNav.style.display = 'block';
      
      // 更新用户名显示（尝试多个可能的字段名）
      const usernameElement = profileNav.querySelector('.user-status-username');
      if (usernameElement) {
        // 尝试多个可能的字段名：username, name, userName, loginName, nickName
        const displayName = currentUser.username 
                         || currentUser.name 
                         || currentUser.userName 
                         || currentUser.loginName 
                         || currentUser.nickName 
                         || currentUser.phone 
                         || '用户';
        
        console.log('显示的用户名:', displayName);
        usernameElement.textContent = displayName;
      }
      
      // 更新状态文本
      if (userStatus) {
        const statusText = userStatus.querySelector('.user-status-text');
        if (statusText) {
          statusText.textContent = '欢迎，';
        }
      }
    } else {
      // 用户未登录
      console.log('用户未登录');
      
      // 显示登录/注册按钮，隐藏用户信息
      if (authNav) authNav.style.display = 'flex';
      if (profileNav) profileNav.style.display = 'none';
    }
  } catch (error) {
    console.error('更新用户状态失败:', error);
  }
}

// ==================== AI智能助手 ==================== 

class AIAssistant {
  constructor() {
    this.apiKey = '';  // 将从后端获取
    this.apiUrl = '';  // 将从后端获取
    this.chatWindow = document.getElementById('aiChatWindow');
    this.inputField = document.getElementById('aiInput');
    this.conversationHistory = [];
    
    this.loadConfig().then(() => this.init());
  }
  
  // 从后端加载API配置
  async loadConfig() {
    try {
      const response = await fetch('/api/config/ai');
      const result = await response.json();
      if (result.code === 200 && result.data) {
        this.apiKey = result.data.apiKey;
        this.apiUrl = result.data.apiUrl;
      }
    } catch (error) {
      console.error('加载AI配置失败:', error);
      // 使用默认值
      this.apiKey = '';
      this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    }
  }
  
  init() {
    console.log('AI助手初始化...');
    
    // 设置快捷按钮
    const quickBtns = document.querySelectorAll('.quick-action-btn');
    console.log('找到快捷按钮数量:', quickBtns.length);
    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        this.handleQuickAction(action);
      });
    });
    
   // 添加系统提示词
    this.systemPrompt = `你是一个专业的电动汽车配送系统助手。你的主要职责是：
1. 帮助用户规划最优配送路线
2. 提供配送优化建议
3. 回答配送相关问题
4. 提供友好的基础信息咨询

能力说明：
- 可以回答基础问题（如时间、日期、常识性问题）
- 可以提供配送相关的专业建议
- 可以进行友好的日常交流

重要限制：
- 你无法直接获取实时天气、路况、充电站、实时交通等信息
- 页面上没有"充电站查询"按钮，不要提及不存在的功能
- 当用户查询这些实时信息时，请：
  1. 明确告知用户你无法直接获取这些实时数据
  2. 引导用户使用页面上真实存在的功能（左侧的高德地图和路线规划）
  3. 提供通用的建议和注意事项
  4. 不要虚构任何不存在的界面元素或功能按钮

页面实际功能：
- 左侧有高德地图组件，可以搜索地点、查看路况
- 有路线规划功能，可以规划配送路线
- 有配送任务管理功能
- 没有独立的充电站查询按钮

回答策略：
1. 对于基础问题（时间、日期、常识）：
   - 直接提供准确答案
   - 简短自然地过渡到配送服务
   - 示例："今天是星期X。作为配送助手，我还能帮您规划路线、优化配送计划。"

2. 对于实时数据查询（天气、路况、充电站）：
   - 诚实说明无法直接获取
   - 引导使用真实功能
   - 提供替代方案

3. 对于配送相关问题：
   - 提供专业建议
   - 结合系统功能
   - 主动引导使用

回答风格：
- 简洁、友好、具体、诚实（每次回答控制在3句话以内）
- 多使用emoji增加亲和力
- 引导用户使用系统内置的高德地图功能
- 绝不提及不存在的功能
- 先解决用户问题，再展示专业能力`;
  }
  
  // 处理快捷操作
  async handleQuickAction(action) {
    let message = '';
    
    switch(action) {
      case 'route':
        message = '请帮我规划一条最优配送路线';
        break;
      case 'charging':
        // 充电站查询直接给出引导，不调用API
        this.showChargingGuide();
        return;
      case 'weather':
        // 天气查询直接给出引导，不调用API
        this.showWeatherGuide();
        return;
      case 'optimize':
        message = '请给我一些配送优化建议';
        break;
    }
    
    if (message) {
      this.inputField.value = message;
      await this.sendMessage();
    }
  }
  
  // 显示天气查询引导
  showWeatherGuide() {
    const guideMessage = `🌤️ <strong>天气和路况查询引导</strong><br><br>

很抱歉，我无法直接获取实时天气和路况信息。但我可以为您提供以下建议：<br><br>

<strong>🌡️ 天气查询方式：</strong><br>
• 使用手机天气应用（如中国天气、墨迹天气）<br>
• 查看当地气象台预报<br>
• 关注交通部门天气预警<br><br>

<strong>🛣️ 路况查询方式：</strong><br>
• <strong>使用页面左侧的高德地图</strong>（可查看实时路况）<br>
• 在地图上搜索目的地查看路况<br>
• 关注交管部门发布信息<br><br>

<strong>⚡ 配送提醒：</strong><br>
• 恶劣天气可能影响配送时间和电池续航<br>
• 建议提前规划备用路线<br>
• 特殊天气时可适当调整配送计划<br><br>

💡 <strong>您可以试试：</strong><br>
1. 使用左侧高德地图查看路况<br>
2. 询问我配送优化建议<br>
3. 让我帮您规划配送路线`;
    
    this.addMessageHTML(guideMessage);
  }
  
  // 显示充电站查询引导
  showChargingGuide() {
    const guideMessage = `⚡ <strong>充电站查询引导</strong><br><br>

很抱歉，我无法直接查询充电站信息。但您可以通过以下方式查找：<br><br>

<strong>🗺️ 使用页面地图功能：</strong><br>
1. 点击页面<strong>左侧的高德地图</strong><br>
2. 在地图搜索框中输入“<strong>充电站</strong>”或“<strong>充电桶</strong>”<br>
3. 地图会显示附近的所有充电设施<br>
4. 点击充电站标记查看详细信息<br><br>

<strong>📱 其他查询方式：</strong><br>
• 使用手机地图应用（高德、百度地图）<br>
• 搜索“国家电网充电站”或“特来电充电站”<br>
• 查看充电运营商官方APP<br><br>

<strong>🔋 配送路线中的充电站：</strong><br>
• 系统在规划配送路线时会<strong>显示途经的充电站</strong><br>
• 建议在电量低于30%时考虑补电<br>
• 长距离配送请提前规划充电点<br><br>

💡 <strong>建议操作：</strong><br>
1. 在左侧地图上搜索“充电站”<br>
2. 让我帮您规划考虑电量的配送路线<br>
3. 询问我充电策略建议`;
    
    this.addMessageHTML(guideMessage);
  }
  
  // 发送消息
  async sendMessage() {
    const message = this.inputField.value.trim();
    if (!message) {
      console.log('消息为空，不发送');
      return;
    }
    
    console.log('发送消息:', message);
    
    // 显示用户消息
    this.addMessage(message, 'user');
    this.inputField.value = '';
    
    // 显示加载状态
    this.showLoading();
    
    try {
      // 构造请求
      const response = await this.callDeepSeekAPI(message);
      
      // 隐藏加载状态
      this.hideLoading();
      
      // 显示AI回复
      this.addMessage(response, 'ai');
      
      // 如果消息包含路线规划相关内容，尝试调用地图功能
      this.tryMapIntegration(message, response);
      
    } catch (error) {
      this.hideLoading();
      console.error('AI调用失败:', error);
      this.addMessage('抱歉，服务暂时不可用，请稍后再试。错误信息: ' + error.message, 'ai');
    }
  }
  
  // 调用DeepSeek API
  async callDeepSeekAPI(userMessage) {
    console.log('调用DeepSeek API...');
    
    // 获取当前配送任务信息
    const context = this.getContextInfo();
    
    // 构造完整的提示词
    const enhancedPrompt = `${this.systemPrompt}

当前系统上下文：
${context}

用户问题：${userMessage}`;
    
    const requestBody = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: enhancedPrompt
        },
        ...this.conversationHistory,
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    };
    
    console.log('请求体:', requestBody);
    
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('响应状态:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API错误:', errorData);
      throw new Error(`API调用失败: ${response.status} - ${errorData.error?.message || '未知错误'}`);
    }
    
    const data = await response.json();
    console.log('API响应:', data);
    
    const aiResponse = data.choices[0].message.content;
    
    // 保存对话历史（最多保留10轮对话）
    this.conversationHistory.push(
      { role: "user", content: userMessage },
      { role: "assistant", content: aiResponse }
    );
    
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
    
    return aiResponse;
  }
  
  // 获取当前系统上下文
  getContextInfo() {
    let context = '';
    
    // 获取当前用户信息（兼容 {user, token} 格式）
    const storedData = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const currentUser = storedData.user || storedData;
    if (currentUser.username) {
      context += `当前用户：${currentUser.username}\n`;
    }
    
    // 获取配送中的任务
    if (window.deliveryTaskManager && window.deliveryTaskManager.tasks) {
      const activeTask = window.deliveryTaskManager.tasks.find(t => t.status === '配送中');
      if (activeTask) {
        context += `当前配送任务：\n`;
        context += `- 任务ID: ${activeTask.id}\n`;
        context += `- 路线: ${activeTask.itinerary || '未知'}\n`;
        context += `- 里程: ${activeTask.mileage || 0}公里\n`;
        context += `- 预计时间: ${activeTask.time || 0}分钟\n`;
        context += `- 预计耗电: ${activeTask.energy || 0}%\n`;
      }
    }
    
    // 获取当前路线信息
    const startAddr = document.getElementById('startAddr')?.value;
    const endAddr = document.getElementById('endAddr')?.value;
    if (startAddr || endAddr) {
      context += `当前输入的路线：\n`;
      if (startAddr) context += `- 起点: ${startAddr}\n`;
      if (endAddr) context += `- 终点: ${endAddr}\n`;
    }
    
    return context || '暂无上下文信息';
  }
  
  // 尝试与地图功能集成
  tryMapIntegration(userMessage, aiResponse) {
    const msg = userMessage.toLowerCase();
    
    // 如果用户询问充电站
    if (msg.includes('充电') || msg.includes('充电站')) {
      console.log('检测到充电站查询');
    }
    
    // 如果用户询问路线规划
    if (msg.includes('路线') || msg.includes('规划')) {
      console.log('检测到路线查询');
    }
  }
  
  // 添加消息到聊天窗口
  addMessage(content, type) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = type === 'user' ? 'user-message-wrapper' : 'ai-reply-wrapper';
    
    if (type === 'ai') {
      // AI头像
      const avatar = document.createElement('div');
      avatar.className = 'ai-avatar';
      avatar.textContent = '🤖';
      messageWrapper.appendChild(avatar);
    }
    
    const message = document.createElement('div');
    message.className = type === 'user' ? 'user-message' : 'ai-message';
    
    // 将文本转换为HTML（支持换行和基本格式）
    const formattedContent = this.formatMessage(content);
    message.innerHTML = formattedContent;
    
    messageWrapper.appendChild(message);
    this.chatWindow.appendChild(messageWrapper);
    
    // 滚动到底部
    this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
  }
  
  // 添加HTML格式消息（用于引导信息）
  addMessageHTML(htmlContent) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'ai-reply-wrapper';
    
    // AI头像
    const avatar = document.createElement('div');
    avatar.className = 'ai-avatar';
    avatar.textContent = '🤖';
    messageWrapper.appendChild(avatar);
    
    const message = document.createElement('div');
    message.className = 'ai-message';
    message.innerHTML = htmlContent; // 直接使用HTML
    
    messageWrapper.appendChild(message);
    this.chatWindow.appendChild(messageWrapper);
    
    // 滚动到底部
    this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
  }
  
  // 格式化消息
  formatMessage(content) {
    // 转换换行为<br>
    let formatted = content.replace(/\n/g, '<br>');
    
    // 转换列表
    formatted = formatted.replace(/- (.+?)<br>/g, '<li>$1</li>');
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }
    
    // 转换粗体
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    return `<p>${formatted}</p>`;
  }
  
  // 显示加载状态
  showLoading() {
    const loadingWrapper = document.createElement('div');
    loadingWrapper.className = 'ai-reply-wrapper';
    loadingWrapper.id = 'ai-loading';
    
    const avatar = document.createElement('div');
    avatar.className = 'ai-avatar';
    avatar.textContent = '🤖';
    loadingWrapper.appendChild(avatar);
    
    const loading = document.createElement('div');
    loading.className = 'ai-message ai-loading';
    loading.innerHTML = '<span></span><span></span><span></span>';
    
    loadingWrapper.appendChild(loading);
    this.chatWindow.appendChild(loadingWrapper);
    this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
  }
  
  // 隐藏加载状态
  hideLoading() {
    const loading = document.getElementById('ai-loading');
    if (loading) {
      loading.remove();
    }
  }
}

// ==================== 配送小贴士轮播功能 ====================
class TipsCarousel {
  constructor() {
    this.currentIndex = 0;
    this.tipItems = [];
    this.tipDots = [];
    this.autoPlayInterval = null;
    this.init();
  }

  init() {
    // 获取所有提示项和导航点
    this.tipItems = document.querySelectorAll('.tip-item');
    this.tipDots = document.querySelectorAll('.tip-dot');

    if (this.tipItems.length === 0) {
      console.warn('未找到提示项元素');
      return;
    }

    // 绑定导航点点击事件
    this.tipDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToSlide(index);
        this.resetAutoPlay();
      });
    });

    // 启动自动轮播
    this.startAutoPlay();

    // 鼠标悬停时暂停轮播
    const routeSuggestion = document.getElementById('routeSuggestion');
    if (routeSuggestion) {
      routeSuggestion.addEventListener('mouseenter', () => this.pauseAutoPlay());
      routeSuggestion.addEventListener('mouseleave', () => this.startAutoPlay());
    }
  }

  // 跳转到指定幻灯片
  goToSlide(index) {
    // 移除当前活动项
    this.tipItems[this.currentIndex].classList.remove('active');
    this.tipItems[this.currentIndex].classList.add('prev');
    this.tipDots[this.currentIndex].classList.remove('active');

    // 设置新的活动项
    this.currentIndex = index;
    
    // 移除所有prev类
    this.tipItems.forEach(item => item.classList.remove('prev'));
    
    this.tipItems[this.currentIndex].classList.add('active');
    this.tipDots[this.currentIndex].classList.add('active');
  }

  // 下一张
  nextSlide() {
    const nextIndex = (this.currentIndex + 1) % this.tipItems.length;
    this.goToSlide(nextIndex);
  }

  // 上一张
  prevSlide() {
    const prevIndex = (this.currentIndex - 1 + this.tipItems.length) % this.tipItems.length;
    this.goToSlide(prevIndex);
  }

  // 启动自动轮播
  startAutoPlay() {
    if (this.autoPlayInterval) return;
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // 每5秒切换
  }

  // 暂停自动轮播
  pauseAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  // 重置自动轮播
  resetAutoPlay() {
    this.pauseAutoPlay();
    this.startAutoPlay();
  }
}

// 初始化提示轮播
window.tipsCarousel = null;
document.addEventListener('DOMContentLoaded', () => {
  window.tipsCarousel = new TipsCarousel();
});

// 初始化装饰元素动画
function initDecorativeElements() {
  const decorativeElements = document.querySelectorAll('.decorative-element');
  decorativeElements.forEach((el, index) => {
    // 为每个装饰元素设置不同的动画延迟
    el.style.animationDelay = `${0.1 * index}s`;
    
    // 添加滚动动画效果
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-float');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    
    observer.observe(el);
  });
}

// 配送任务管理
class DeliveryTaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.filterCallbacks = [];
        // 分页配置
        this.pagination = {
            currentPage: 1,
            pageSize: 5,
            totalRecords: 0,
            totalPages: 0
        };
    }

    // 加载配送任务数据
  async loadDeliveryTasks(viewAllTasks = false) {
    try {
      // 检查fetch API是否可用
      if (typeof fetch !== 'function') {
        throw new Error('浏览器不支持fetch API');
      }
      
      // 显示加载状态
      this.showLoadingState();
      
      // 获取当前登录用户信息（兼容 {user, token} 格式）
      const storedData = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
      const currentUser = storedData.user || storedData;
      const token = storedData.token || localStorage.getItem('authToken');
      
      let apiUrl = '/api/delivery/task/list';
      
      // 检查是否为管理员并选择查看所有用户任务
      const isAdmin = currentUser && currentUser.role === 'ADMIN';
      const shouldViewAll = viewAllTasks || window.adminViewAllTasks;
      
      if (isAdmin && shouldViewAll) {
        // 管理员查看所有用户任务
        apiUrl = '/api/admin/task/list';
        console.log('管理员模式: 加载所有用户的配送任务');
      } else if (currentUser && currentUser.id) {
        // 用户已登录，根据用户ID获取特定任务
        apiUrl = `/api/delivery/task/listByUser/${currentUser.id}`;
        console.log(`加载用户 ${currentUser.id} 的配送任务`);
      } else {
        console.log('用户未登录，显示所有配送任务');
      }
      
      // 添加超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // 构建请求头（带token）
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: headers
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // 验证返回的数据格式
      if (!result || typeof result !== 'object') {
        throw new Error('返回数据格式不正确');
      }
      
      if (result.code === 200) {
        // 检查data字段是否存在且为数组
        if (result.data && Array.isArray(result.data)) {
          this.tasks = result.data;
          this.renderTasks();
          this.updateTaskStats();
          this.setupFilterHandlers();
          
          // 记录成功加载
          console.log(`成功加载 ${this.tasks.length} 个配送任务`);
          
          // 检查是否有配送中的任务，如果有则自动显示路线
          await this.autoLoadActiveDeliveryRoute();
        } else {
          // 如果data字段不存在或不是数组，使用空数组
          this.tasks = [];
          this.renderTasks();
          this.updateTaskStats();
          console.log('配送任务列表为空');
        }
      } else {
        console.error('加载配送任务失败:', result.message);
        this.showMessage(result.message || '加载配送任务失败', 'error');
        this.showFallbackData();
      }
    } catch (error) {
      console.error('加载配送任务失败:', error);
      this.showMessage('网络错误，请检查连接', 'error');
      this.showFallbackData();
    }
  }

  // 显示加载状态
  showLoadingState() {
    const tbody = document.getElementById("deliveryTasks");
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7" class="loading-state">加载中...</td></tr>';
    }
  }

  // 隐藏加载状态
  hideLoadingState() {
    // 加载状态会在renderTasks中被替换
  }

  // 显示备用数据
  showFallbackData() {
    // 如果主数据加载失败，显示模拟数据
    if (this.tasks.length === 0) {
      this.tasks = [
        {
          id: 1,
          name: '示例配送任务 #001',
          route: '北京朝阳区 → 海淀区',
          distance: 25.5,
          time: '45分钟',
          power: '15%',
          status: 'pending'
        }
      ];
      this.renderTasks();
      this.updateTaskStats();
      this.showMessage('已加载示例数据，请检查网络连接', 'warning');
    }
  }

  // 更新任务统计信息（已禁用，保持界面简洁）
  updateTaskStats() {
    // 根据项目规范，不再显示任务统计信息
    // 统计功能已移除，保持界面整洁
    console.log('任务统计功能已禁用');
  }

  // 自动加载配送中任务的路线
  async autoLoadActiveDeliveryRoute() {
    try {
      console.log('=== 检查是否有配送中的任务 ===');
      
      // 查找状态为“配送中”的任务
      const activeTask = this.tasks.find(task => task.status === '配送中');
      
      if (!activeTask) {
        console.log('没有配送中的任务');
        return;
      }
      
      console.log('发现配送中的任务:', activeTask);
      
      // 检查地图服务是否就绪
      if (!window.routePlanner || !window.routePlanner.mapInitialized) {
        console.log('地图服务尚未初始化，等待500ms后重试');
        setTimeout(() => this.autoLoadActiveDeliveryRoute(), 500);
        return;
      }
      
      console.log('开始显示配送中任务的路线');
      
      // 获取当前位置作为起点
      let currentPosition = null;
      if (window.routePlanner.geolocation) {
        currentPosition = await this.getCurrentPosition();
      }
      
      // 构造路线规划的起点、途经点、终点
      const waypoints = [];
      
      // 起点：当前位置（如果有）
      if (currentPosition && currentPosition.address) {
        waypoints.push({ keyword: currentPosition.address, city: '' });
        console.log('起点（当前位置）:', currentPosition.address);
      } else if (activeTask.startAddr) {
        // 如果没有当前位置，使用任务起点
        waypoints.push({ keyword: activeTask.startAddr, city: '' });
        console.log('起点（任务起点）:', activeTask.startAddr);
      }
      
      // 途经点：任务起点（如果当前位置已作为起点）
      if (currentPosition && currentPosition.address && activeTask.startAddr) {
        waypoints.push({ keyword: activeTask.startAddr, city: '' });
        console.log('途经点（任务起点）:', activeTask.startAddr);
      }
      
      // 终点：任务终点
      if (activeTask.endAddr) {
        waypoints.push({ keyword: activeTask.endAddr, city: '' });
        console.log('终点（任务终点）:', activeTask.endAddr);
      } else {
        console.warn('任务没有终点地址，无法显示路线');
        return;
      }
      
      // 如果至少有起点和终点，则进行路线规划
      if (waypoints.length >= 2) {
        // 同步更新地图输入框
        const startAddrInput = document.getElementById('startAddr');
        const endAddrInput = document.getElementById('endAddr');
        if (startAddrInput) startAddrInput.value = waypoints[0].keyword;
        if (endAddrInput) endAddrInput.value = waypoints[waypoints.length - 1].keyword;
        
        // 调用高德地图路线规划
        window.routePlanner.driving.search(waypoints, (status, result) => {
          if (status === 'complete' && result.routes && result.routes[0]) {
            const route = result.routes[0];
            const distance = (route.distance / 1000).toFixed(1);
            const duration = Math.floor(route.time / 60);
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            const timeDisplay = hours > 0 
              ? `${hours}小时${minutes > 0 ? `${minutes}分钟` : ''}` 
              : `${minutes}分钟`;
            
            console.log('配送中任务路线规划成功:', { distance, timeDisplay });
            
            // 显示配送任务信息
            this.showDeliveryTaskInfo(activeTask, distance, timeDisplay);
            
            // 搜索沿途充电站
            const routePoints = this.getRoutePointsFromResult(route);
            this.searchChargingStationsForRoute(routePoints);
            
            this.showMessage('已自动加载配送中任务的路线', 'success');
          } else {
            console.error('路线规划失败:', status, result);
          }
        });
      }
    } catch (error) {
      console.error('自动加载配送路线失败:', error);
    }
  }

  // 设置筛选处理器
  setupFilterHandlers() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const filter = e.target.getAttribute('data-filter') || 'all';
        this.filterTasks(filter);
      });
    });
  }

  // 筛选任务
  filterTasks(filter) {
    console.log('筛选任务，过滤器:', filter);
    this.currentFilter = filter;
    this.pagination.currentPage = 1; // 筛选时重置到第一页
    
    // 更新筛选按钮状态
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      const buttonFilter = button.getAttribute('data-filter');
      if (buttonFilter === filter) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    this.renderTasks();
    
    // 触发筛选回调
    this.filterCallbacks.forEach(callback => callback(filter));
  }

  // 添加筛选回调
  onFilterChange(callback) {
    this.filterCallbacks.push(callback);
  }
    
    // 显示登录提示信息
    showLoginRequiredMessage() {
        const tbody = document.getElementById("deliveryTasks");
        if (!tbody) return;
        
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 48px; color: #ccc; margin-bottom: 10px;">🔒</div>
                    <div style="font-size: 16px; color: #666; margin-bottom: 20px;">
                        请先登录以查看配送任务
                    </div>
                    <button class="login-prompt-btn" onclick="window.location.href='login.html'">
                        前往登录
                    </button>
                </td>
            </tr>
        `;
    }

    // 转换状态为前端使用的格式
    convertStatusToFrontend(status) {
        const statusMap = {
            '待配送': 'pending',
            '配送中': 'active',
            '配送完成': 'completed'
        };
        return statusMap[status] || status;
    }

    // 渲染配送任务表格
  renderTasks() {
    const tbody = document.getElementById("deliveryTasks");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    // 检查用户是否登录
    const userData = sessionStorage.getItem('currentUser');
    const isLoggedIn = !!userData;

    // 排序逻辑：配送中 > 待配送（按创建时间降序） > 配送完成（按完成时间降序）
    const statusPriority = {
      '配送中': 3,
      '待配送': 2,
      '配送完成': 1
    };
    
    // 先筛选任务
    let filteredTasks = this.tasks;
    if (this.currentFilter !== 'all') {
      filteredTasks = this.tasks.filter(task => {
        const frontendStatus = this.convertStatusToFrontend(task.status);
        return frontendStatus === this.currentFilter;
      });
    }
    
    // 更新分页信息
    this.pagination.totalRecords = filteredTasks.length;
    this.pagination.totalPages = Math.ceil(filteredTasks.length / this.pagination.pageSize);
    
    // 确保当前页有效
    if (this.pagination.currentPage > this.pagination.totalPages) {
      this.pagination.currentPage = Math.max(1, this.pagination.totalPages);
    }
    
    if (filteredTasks.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="7" style="text-align: center; color: #666;">暂无配送任务</td>`;
      tbody.appendChild(row);
      this.renderDeliveryPagination();
      return;
    }
    
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      // 状态优先级：配送中(3) > 待配送(2) > 配送完成(1)
      const priorityA = statusPriority[a.status] || 0;
      const priorityB = statusPriority[b.status] || 0;
      
      // 首先按状态优先级排序
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // 降序
      }
      
      // 相同状态时，按时间排序
      if (a.status === '配送完成') {
        // 配送完成按完成时间降序
        const timeA = a.endTime ? new Date(a.endTime).getTime() : 0;
        const timeB = b.endTime ? new Date(b.endTime).getTime() : 0;
        return timeB - timeA;
      } else {
        // 待配送和配送中按创建时间降序
        const timeA = a.createTime ? new Date(a.createTime).getTime() : 0;
        const timeB = b.createTime ? new Date(b.createTime).getTime() : 0;
        return timeB - timeA;
      }
    });
    
    // 分页截取数据
    const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize;
    const endIndex = startIndex + this.pagination.pageSize;
    const pageTasks = sortedTasks.slice(startIndex, endIndex);
    
    console.log(`显示第 ${startIndex + 1} 到 ${Math.min(endIndex, sortedTasks.length)} 条，共 ${sortedTasks.length} 条`);

    pageTasks.forEach(task => {
      const row = document.createElement("tr");
      
      // 转换状态为前端使用的格式
      const frontendStatus = this.convertStatusToFrontend(task.status);
      
      // 根据状态添加CSS类
      row.className = `task-row ${frontendStatus}`;
      
      // 根据登录状态显示不同的操作按钮
      let actionButtons = '';
      if (isLoggedIn) {
        // 已登录用户显示操作按钮
        if (frontendStatus === 'pending') {
          actionButtons = `<button class="operate-btn" onclick="deliveryTaskManager.startDelivery('${task.id}')">去配送</button>`;
        } else if (frontendStatus === 'active') {
          actionButtons = `
            <button class="operate-btn complete-btn" onclick="deliveryTaskManager.completeDelivery('${task.id}')">完成配送</button>
            <button class="operate-btn cancel-btn" onclick="deliveryTaskManager.cancelDelivery('${task.id}')">取消配送</button>
          `;
        } else if (frontendStatus === 'completed') {
          actionButtons = `<span style="color: #28a745;">已完成</span>`;
        }
      } else {
        // 未登录用户显示提示信息
        actionButtons = `
          ${frontendStatus === 'pending' ? `<span style="color: #666; font-size: 12px;">请登录后操作</span>` : ''}
          ${frontendStatus === 'active' ? `<span style="color: #666; font-size: 12px;">请登录后操作</span>` : ''}
          ${frontendStatus === 'completed' ? `<span style="color: #28a745;">已完成</span>` : ''}
        `;
      }
      
      row.innerHTML = `
        <td>${task.id}</td>
        <td>${task.itinerary || ''}</td>
        <td>${task.mileage || 0}公里</td>
        <td>${task.time || 0}分钟</td>
        <td>${task.energy || 0}%</td>
        <td><span class="status ${frontendStatus === 'active' ? 'status-active' : frontendStatus === 'completed' ? 'status-completed' : 'status-pending'}">${this.getStatusText(frontendStatus)}</span></td>
        <td>${actionButtons}</td>
      `;
      tbody.appendChild(row);
    });
    
    // 渲染分页控件
    this.renderDeliveryPagination();
  }
  
  // 渲染配送任务分页控件
  renderDeliveryPagination() {
    const container = document.getElementById('deliveryPaginationContainer');
    if (!container) return;
    
    const { currentPage, pageSize, totalRecords, totalPages } = this.pagination;
    
    if (totalRecords === 0) {
      container.innerHTML = '';
      return;
    }
    
    // 生成页码按钮
    let pageButtons = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageButtons += `
        <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                onclick="deliveryTaskManager.goToPage(${i})">${i}</button>
      `;
    }
    
    container.innerHTML = `
      <div class="pagination-info">
        <span class="pagination-total">共 <strong>${totalRecords}</strong> 条记录</span>
        <span class="pagination-current">第 ${currentPage} / ${totalPages} 页</span>
      </div>
      <div class="pagination-controls">
        <div class="pagination-size">
          <label>每页显示</label>
          <select class="pagination-select" onchange="deliveryTaskManager.changePageSize(this.value)">
            <option value="5" ${pageSize === 5 ? 'selected' : ''}>5条</option>
            <option value="10" ${pageSize === 10 ? 'selected' : ''}>10条</option>
            <option value="20" ${pageSize === 20 ? 'selected' : ''}>20条</option>
            <option value="50" ${pageSize === 50 ? 'selected' : ''}>50条</option>
          </select>
        </div>
        <div class="pagination-btns">
          <button class="pagination-btn nav-btn" onclick="deliveryTaskManager.goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>
            首页
          </button>
          <button class="pagination-btn nav-btn" onclick="deliveryTaskManager.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            上一页
          </button>
          ${pageButtons}
          <button class="pagination-btn nav-btn" onclick="deliveryTaskManager.goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            下一页
          </button>
          <button class="pagination-btn nav-btn" onclick="deliveryTaskManager.goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
            末页
          </button>
        </div>
      </div>
    `;
  }
  
  // 跳转到指定页
  goToPage(page) {
    if (page < 1 || page > this.pagination.totalPages) return;
    this.pagination.currentPage = page;
    this.renderTasks();
  }
  
  // 修改每页显示数量
  changePageSize(size) {
    this.pagination.pageSize = parseInt(size);
    this.pagination.currentPage = 1;
    this.renderTasks();
  }

  // 获取状态文本
  getStatusText(status) {
    const statusTextMap = {
      'pending': '待配送',
      'active': '配送中',
      'completed': '配送完成'
    };
    return statusTextMap[status] || status;
  }

    // 开始配送
  async startDelivery(taskId) {
    try {
      // 检查用户是否登录
      const userData = sessionStorage.getItem('currentUser');
      if (!userData) {
        if (confirm('此功能需要登录后才能使用，是否前往登录？')) {
          window.location.href = 'login.html';
        }
        return;
      }

      // 获取任务详情
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) {
        this.showMessage('任务不存在', 'error');
        return;
      }

      // 首先调用高德地图显示配送路线
      const routeDisplayed = await this.showDeliveryRoute(task);
      if (!routeDisplayed) {
        this.showMessage('路线规划失败，请检查地址信息', 'error');
        return;
      }

      // 调用后端API开始配送
      const response = await fetch(`/api/delivery/task/start/${taskId}`, {
        method: 'PUT'
      });
      const result = await response.json();
      
      if (result.code === 200) {
        this.showMessage('开始配送成功', 'success');
        await this.loadDeliveryTasks(); // 重新加载任务列表
        this.updateTaskStats(); // 更新统计信息
      } else {
        this.showMessage(result.message || '开始配送失败', 'error');
      }
    } catch (error) {
      console.error('开始配送出错:', error);
      this.showMessage('网络错误，请检查连接', 'error');
    }
  }

  // 显示配送路线
  async showDeliveryRoute(task) {
    try {
      console.log('开始规划配送路线，任务信息:', task);
      
      // 检查地图服务是否已准备就绪
      if (!window.routePlanner || !window.routePlanner.map || !window.routePlanner.driving) {
        console.error('地图服务尚未准备就绪');
        this.showMessage('地图服务初始化中，请稍候重试', 'warning');
        return false;
      }

      // 清空地图上的现有标记和路线
      window.routePlanner.map.clearMap();

      // 获取起点地址（当前位置或任务起点）
      let startAddr = task.startAddr;
      if (!startAddr || startAddr.trim() === '') {
        // 如果任务没有起点地址，尝试获取当前位置
        const currentLocation = await this.getCurrentPosition();
        if (currentLocation) {
          startAddr = currentLocation.address;
        } else {
          this.showMessage('无法获取起点位置，请在任务中设置起点地址', 'error');
          return false;
        }
      }

      // 获取终点地址
      const endAddr = task.endAddr;
      if (!endAddr || endAddr.trim() === '') {
        this.showMessage('配送终点地址不能为空', 'error');
        return false;
      }

      console.log('起点:', startAddr, '终点:', endAddr);

      // 同步更新地图输入框的起点和终点地址
      const startAddrInput = document.getElementById('startAddr');
      const endAddrInput = document.getElementById('endAddr');
      if (startAddrInput) startAddrInput.value = startAddr;
      if (endAddrInput) endAddrInput.value = endAddr;

      // 显示加载提示
      const routeSuggestion = document.getElementById('routeSuggestion');
      if (routeSuggestion) {
        routeSuggestion.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; margin-bottom: 10px;">🚗</div>
            <h3>正在规划配送路线...</h3>
            <p style="color: rgba(255,255,255,0.8); margin-top: 10px;">请稍候</p>
          </div>
        `;
      }

      // 使用Promise包装高德地图路线规划
      return new Promise((resolve) => {
        window.routePlanner.driving.search([
          { keyword: startAddr, city: '' },
          { keyword: endAddr, city: '' }
        ], (status, result) => {
          if (status === 'complete' && result.routes && result.routes[0]) {
            const route = result.routes[0];
            const distance = (route.distance / 1000).toFixed(1); // 公里
            const duration = Math.floor(route.time / 60); // 分钟
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            const timeDisplay = hours > 0 
              ? `${hours}小时${minutes > 0 ? `${minutes}分钟` : ''}` 
              : `${minutes}分钟`;

            // 显示配送任务信息和路线详情
            this.showDeliveryTaskInfo(task, distance, timeDisplay);

            // 搜索沿途充电站
            const routePoints = this.getRoutePointsFromResult(route);
            this.searchChargingStationsForRoute(routePoints);

            console.log('配送路线规划成功:', { distance, timeDisplay });
            resolve(true);
          } else {
            console.error('路线规划失败:', status, result);
            this.showMessage('路线规划失败，请检查地址是否正确', 'error');
            this.restoreDefaultRouteSuggestion();
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error('显示配送路线失败:', error);
      this.showMessage('显示配送路线失败: ' + error.message, 'error');
      return false;
    }
  }

  // 获取当前位置
  async getCurrentPosition() {
    try {
      if (!window.routePlanner || !window.routePlanner.geolocation) {
        console.warn('定位服务未就绪');
        return null;
      }

      return new Promise((resolve) => {
        window.routePlanner.geolocation.getCurrentPosition((status, result) => {
          if (status === 'complete' && result.position) {
            // 逆地理编码获取地址
            AMap.plugin('AMap.Geocoder', () => {
              const geocoder = new AMap.Geocoder();
              geocoder.getAddress([result.position.lng, result.position.lat], (geoStatus, geoResult) => {
                if (geoStatus === 'complete' && geoResult.regeocode) {
                  resolve({
                    position: result.position,
                    address: geoResult.regeocode.formattedAddress
                  });
                } else {
                  resolve({
                    position: result.position,
                    address: `${result.position.lng},${result.position.lat}`
                  });
                }
              });
            });
          } else {
            console.warn('获取当前位置失败');
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('获取当前位置异常:', error);
      return null;
    }
  }

  // 从路线结果中提取关键点
  getRoutePointsFromResult(route) {
    const points = [];
    try {
      let pathPoints = [];

      if (route.steps && route.steps.length > 0) {
        route.steps.forEach(step => {
          if (step.path && step.path.length > 0) {
            pathPoints = pathPoints.concat(step.path);
          }
        });
      }

      if (pathPoints.length > 0) {
        const totalPoints = pathPoints.length;
        const positions = [0, 0.25, 0.5, 0.75, 1]; // 5个关键点

        positions.forEach(ratio => {
          const index = Math.min(Math.floor(ratio * (totalPoints - 1)), totalPoints - 1);
          const point = pathPoints[index];
          if (point && typeof point.lng === 'number' && typeof point.lat === 'number') {
            points.push([point.lng, point.lat]);
          }
        });
      }
    } catch (error) {
      console.error('提取路线关键点失败:', error);
    }
    return points;
  }

  // 搜索路线沿途的充电站
  async searchChargingStationsForRoute(routePoints) {
    console.log('=== 开始搜索沿途充电站 ===');
    console.log('路线关键点数量:', routePoints.length);
    
    if (!window.routePlanner || !window.routePlanner.placeSearch) {
      console.error('地图服务或搜索服务未就绪');
      return;
    }
    
    if (routePoints.length === 0) {
      console.warn('没有路线关键点，无法搜索充电站');
      return;
    }

    try {
      const searchNearbyStations = async (point) => {
        return new Promise((resolve) => {
          window.routePlanner.placeSearch.searchNearBy('充电站', point, 3000, (status, result) => {
            if (status === 'complete' && result.poiList?.pois) {
              console.log(`在点 [${point[0]}, ${point[1]}] 附近找到 ${result.poiList.pois.length} 个充电站`);
              resolve(result.poiList.pois);
            } else {
              console.log(`在点 [${point[0]}, ${point[1]}] 附近未找到充电站`);
              resolve([]);
            }
          });
        });
      };

      const allResults = await Promise.all(
        routePoints.map(point => searchNearbyStations(point))
      );

      // 合并结果并去重
      const seenKeys = new Set();
      const uniqueStations = [];

      for (const stations of allResults) {
        for (const station of stations) {
          const key = `${station.location.lng.toFixed(4)},${station.location.lat.toFixed(4)}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueStations.push(station);
          }
        }
      }

      console.log(`总共找到 ${uniqueStations.length} 个独特充电站`);

      // 在地图上标记充电站
      if (uniqueStations.length > 0) {
        this.markChargingStationsOnMap(uniqueStations);
      } else {
        console.warn('没有找到充电站');
      }
    } catch (error) {
      console.error('搜索充电站失败:', error);
    }
  }

  // 在地图上标记充电站
  markChargingStationsOnMap(stations) {
    console.log('=== 开始标记充电站 ===');
    console.log('需要标记的充电站数量:', stations.length);
    
    if (!window.routePlanner || !window.routePlanner.map) {
      console.error('地图服务未就绪');
      return;
    }

    const stationIcon = './markers/charging_station.jpg';
    console.log('充电站图标路径:', stationIcon);
    
    let markedCount = 0;
    stations.forEach((station, index) => {
      try {
        const marker = new AMap.Marker({
          position: [station.location.lng, station.location.lat],
          icon: new AMap.Icon({
            size: new AMap.Size(30, 30),
            content: `<div style="width: 30px; height: 30px; border-radius: 50%; overflow: hidden; border: 2px solid #00cc66;"><img src="${stationIcon}" style="width: 100%; height: 100%; object-fit: cover;"></div>`,
            imageSize: new AMap.Size(30, 30)
          }),
          title: station.name
        });

        const infoWindow = new AMap.InfoWindow({
          content: `<div style="padding: 12px; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #1890ff;">${station.name}</h4>
          <p style="margin: 4px 0; font-size: 14px;"><strong>地址:</strong> ${station.address}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>距离:</strong> ${station.distance ? (station.distance / 1000).toFixed(1) : '0.0'}公里</p>
        </div>`
        });

        marker.on('click', () => infoWindow.open(window.routePlanner.map, marker.getPosition()));
        marker.setMap(window.routePlanner.map);
        markedCount++;
        
        console.log(`标记第 ${index + 1} 个充电站: ${station.name}`);
      } catch (error) {
        console.error(`标记充电站 ${station.name} 失败:`, error);
      }
    });
    
    console.log(`成功标记 ${markedCount} 个充电站`);
  }

    // 显示配送温馨提示（不显示重复的任务信息）
    showDeliveryTaskInfo(task, distance, timeDisplay) {
      // 调用统一的配送小贴士显示方法
      if (window.routePlanner && typeof window.routePlanner.showUnifiedDeliveryTips === 'function') {
        window.routePlanner.showUnifiedDeliveryTips(parseFloat(distance), timeDisplay);
      }
    }

    // 完成配送
  async completeDelivery(taskId) {
    try {
      // 获取任务详情
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) {
        this.showMessage('任务不存在', 'error');
        return;
      }

      // 验证当前位置是否在配送终点附近（可选验证）
      const isValidLocation = await this.validateDeliveryLocation(task);
      
      if (!isValidLocation) {
        // 询问用户是否强制完成
        if (!confirm('检测到您当前位置可能不在配送终点附近，是否仍要完成配送？')) {
          return;
        }
      }

      const response = await fetch(`/api/delivery/task/complete/${taskId}`, {
        method: 'PUT'
      });
      const result = await response.json();
      
      if (result.code === 200) {
        this.showMessage('配送完成', 'success');
        
        // 清除地图上的配送标记和路线
        if (window.routePlanner && window.routePlanner.map) {
          window.routePlanner.map.clearMap();
        }
        
        // 恢复默认的路线建议内容
        this.restoreDefaultRouteSuggestion();
        
        await this.loadDeliveryTasks(); // 重新加载任务列表
        this.updateTaskStats(); // 更新统计信息
      } else {
        this.showMessage(result.message || '完成配送失败', 'error');
      }
    } catch (error) {
      console.error('完成配送出错:', error);
      this.showMessage('网络错误，请检查连接', 'error');
    }
  }

  // 取消配送（将配送中的任务改为待配送）
  async cancelDelivery(taskId) {
    try {
      console.log('=== 开始取消配送 ===');
      console.log('任务ID:', taskId);
      
      // 获取任务详情
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) {
        this.showMessage('任务不存在', 'error');
        return;
      }
      
      console.log('找到任务:', task);

      // 确认取消配送
      if (!confirm('确定要取消当前配送任务吗？')) {
        console.log('用户取消操作');
        return;
      }
      
      console.log('调用API: /api/delivery/task/cancel/' + taskId);

      const response = await fetch(`/api/delivery/task/cancel/${taskId}`, {
        method: 'PUT'
      });
      
      console.log('响应状态:', response.status);
      const result = await response.json();
      console.log('响应结果:', result);
      
      if (result.code === 200) {
        this.showMessage('已取消配送，任务已恢复为待配送状态', 'success');
        
        // 清除地图上的配送标记和路线
        if (window.routePlanner && window.routePlanner.map) {
          window.routePlanner.map.clearMap();
        }
        
        // 恢复默认的路线建议内容
        this.restoreDefaultRouteSuggestion();
        
        await this.loadDeliveryTasks(); // 重新加载任务列表
        this.updateTaskStats(); // 更新统计信息
      } else {
        console.error('取消配送失败，后端返回错误:', result.message);
        this.showMessage(result.message || '取消配送失败', 'error');
      }
    } catch (error) {
      console.error('取消配送出错:', error);
      this.showMessage('网络错误，请检查连接', 'error');
    }
  }

  // 验证配送位置（简化版本）
  async validateDeliveryLocation(task) {
    try {
      // 如果没有终点地址，直接返回true
      if (!task.endAddr) {
        return true;
      }

      // 获取当前位置
      const currentLocation = await this.getCurrentPosition();
      if (!currentLocation) {
        console.warn('无法获取当前位置，跳过位置验证');
        return true; // 无法获取位置时允许完成
      }

      // 这里可以添加位置距离验证逻辑
      // 暂时简化处理，返回true允许完成
      return true;
    } catch (error) {
      console.error('验证配送位置失败:', error);
      return true; // 验证失败时允许完成
    }
  }

  // 恢复默认的路线建议内容
  restoreDefaultRouteSuggestion() {
    const routeSuggestion = document.getElementById('routeSuggestion');
    if (routeSuggestion) {
      routeSuggestion.innerHTML = `
        <h4>嘿，配送小伙伴～</h4> 
        <h4>这里是您的「配送小贴士」，每天为你寄来一句暖萌提醒，还有天气小锦囊，只为让你送得顺、赚得稳、心里暖暖的。</h4>
        <h4>我们一起出发，为你带来更贴心的服务！</h4>
      `;
    }
  }

  // 显示消息（使用玻璃质感设计）
  showMessage(message, type = 'info') {
    console.log(`[${type}] ${message}`);
    
    // 创建消息提示元素
    const messageBox = document.createElement('div');
    
    // 根据类型设置颜色和图标
    let icon = 'ℹ️';
    let bgColor = 'rgba(10, 108, 255, 0.9)'; // 信息 - 蓝色
    
    if (type === 'success') {
      icon = '✅';
      bgColor = 'rgba(16, 185, 129, 0.9)'; // 成功 - 绿色
    } else if (type === 'error') {
      icon = '❌';
      bgColor = 'rgba(239, 68, 68, 0.9)'; // 错误 - 红色
    } else if (type === 'warning') {
      icon = '⚠️';
      bgColor = 'rgba(245, 158, 11, 0.9)'; // 警告 - 黄色
    }
    
    messageBox.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      min-width: 320px;
      max-width: 450px;
      background: ${bgColor};
      backdrop-filter: var(--glass-blur);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      box-shadow: var(--shadow-xl);
      z-index: 10000;
      animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      color: white;
      font-size: var(--text-base);
      display: flex;
      align-items: center;
      gap: var(--space-md);
    `;
    
    messageBox.innerHTML = `
      <span style="font-size: 24px; flex-shrink: 0;">${icon}</span>
      <span style="flex: 1; line-height: 1.5;">${message}</span>
      <button onclick="this.parentElement.remove()" style="
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: var(--transition-fast);
      " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
    `;
    
    document.body.appendChild(messageBox);
    
    // 4秒后自动移除
    setTimeout(() => {
      if (messageBox.parentNode) {
        messageBox.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
          if (messageBox.parentNode) {
            messageBox.remove();
          }
        }, 300);
      }
    }, 4000);
  }
}

// 创建配送任务管理器实例
const deliveryTaskManager = new DeliveryTaskManager();

// 用户状态管理
class UserStatusManager {
    constructor() {
        console.log('UserStatusManager constructor called');
        this.currentUser = null;
        this.init();
    }// 初始化
    init() {
        console.log('UserStatusManager init() called');
        this.loadUserStatus();
        this.setupEventListeners();
    }

    // 加载用户状态
    loadUserStatus() {
        console.log('loadUserStatus() called');
        // 优先从 sessionStorage 读取，如果没有则从 localStorage 读取
        let userData = sessionStorage.getItem('currentUser');
        if (!userData) {
            userData = localStorage.getItem('currentUser');
            // 如果从 localStorage 读取到了，同步到 sessionStorage
            if (userData) {
                sessionStorage.setItem('currentUser', userData);
            }
        }
        console.log('currentUser:', userData);
        
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                // 兼容两种格式：{user, token} 或直接的用户对象
                this.currentUser = parsed.user || parsed;
                console.log('Parsed user data:', this.currentUser);
                this.updateUI();
            } catch (error) {
                console.error('解析用户数据失败:', error);
                this.clearUserData();
            }
        } else {
            console.log('No user data found');
            this.updateUI();
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.navigateToLogin();
            });
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.navigateToRegister();
            });
        }

        // 监听storage变化，以便在多个标签页间同步登录状态
        window.addEventListener('storage', (e) => {
            if (e.key === 'currentUser') {
                this.loadUserStatus();
            }
        });
        
        // 监听页面可见性变化，当从个人资料页返回时刷新用户信息
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // 页面变为可见时，重新加载用户状态
                this.loadUserStatus();
            }
        });
    }

    // 更新UI显示
    updateUI() {
        console.log('updateUI() called');
        
        const userStatusElement = document.getElementById('userStatus');
        const authNav = document.getElementById('authNav');
        const profileNav = document.getElementById('profileNav');
        const deliveryOverlay = document.getElementById('deliveryOverlay');

        console.log('Current user:', this.currentUser);
        console.log('Profile nav element:', profileNav);
        console.log('User status element:', userStatusElement);
        console.log('Auth nav element:', authNav);

        if (this.currentUser) {
            console.log('用户已登录，显示个人主页链接');
            
            // 用户已登录 - 隐藏#userStatus，只显示#profileNav
            if (userStatusElement) userStatusElement.style.display = 'none';
            
            // 隐藏登录注册按钮区域
            if (authNav) authNav.style.display = 'none';
            
            // 显示个人主页链接并更新用户名
            if (profileNav) {
                profileNav.style.display = 'flex';
                console.log('个人主页链接显示状态:', profileNav.style.display);
                const profileLink = profileNav.querySelector('.profile-link');
                const usernameElement = profileNav.querySelector('.user-status-username');
                if (profileLink && usernameElement) {
                    // 显示账号名（username）
                    usernameElement.textContent = this.currentUser.username || this.currentUser.name || '用户';
                    
                    // 确保链接可点击：移除disabled属性，设置正确的样式
                    profileLink.removeAttribute('disabled');
                    profileLink.style.pointerEvents = 'auto';
                    profileLink.style.cursor = 'pointer';
                    profileLink.style.zIndex = '1000';
                    
                    // 移除原有事件监听器，重新绑定
                    profileLink.onclick = null;
                    profileLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('个人主页链接被点击');
                        this.navigateToProfile();
                    }, false);
                    
                    // 为用户名元素也添加点击事件（双重保障）
                    usernameElement.style.cursor = 'pointer';
                    usernameElement.style.pointerEvents = 'auto';
                    usernameElement.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('用户名被点击');
                        this.navigateToProfile();
                    };
                    
                    console.log('用户名已更新:', usernameElement.textContent);
                    console.log('个人主页链接点击事件已绑定');
                }
            }
            
            // 隐藏配送任务模糊遮罩层
            if (deliveryOverlay) {
                deliveryOverlay.classList.remove('active');
            }
        } else {
            console.log('用户未登录，显示登录注册按钮');
            // 用户未登录 - 显示#userStatus，隐藏#profileNav
            if (userStatusElement) {
                userStatusElement.style.display = 'flex';
                userStatusElement.className = 'user-status';
                userStatusElement.innerHTML = `
                    <span class="user-status-icon">🔒</span>
                    <span class="user-status-text">请先登录</span>
                `;
            }
            
            // 显示登录注册按钮区域
            if (authNav) authNav.style.display = 'flex';
            
            // 隐藏个人主页链接
            if (profileNav) profileNav.style.display = 'none';
            
            // 显示配送任务模糊遮罩层
            if (deliveryOverlay) {
                deliveryOverlay.classList.add('active');
            }
        }

        // 更新配送任务显示（根据登录状态）
        if (deliveryTaskManager && typeof deliveryTaskManager.renderTasks === 'function') {
            deliveryTaskManager.renderTasks();
        }
        

    }

    // 导航到登录页面
    navigateToLogin() {
        window.location.href = '/html/login.html';
    }

    // 导航到注册页面
    navigateToRegister() {
        window.location.href = '/html/register.html';
    }

    // 导航到个人信息页面
    navigateToProfile() {
        if (this.currentUser) {
            console.log('跳转到个人信息页面');
            // 通过 URL 参数传递用户 ID，确保跨页面可用
            window.location.href = '/html/profile.html?userId=' + encodeURIComponent(this.currentUser.id);
        } else {
            console.log('用户未登录，跳转到登录页面');
            this.navigateToLogin();
        }
    }

    // 清除用户数据
    clearUserData() {
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.updateUI();
    }

    // 登录用户
    login(userData) {
        try {
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
            this.currentUser = userData;
            this.updateUI();
            
            // 显示登录成功消息
            this.showLoginSuccess();
            
            return true;
        } catch (error) {
            console.error('登录失败:', error);
            return false;
        }
    }

    // 显示登录成功消息
    showLoginSuccess() {
        // 创建临时成功消息
        const successMessage = document.createElement('div');
        successMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            font-weight: 500;
        `;
        successMessage.innerHTML = `
            <span style="margin-right: 8px;">✅</span>
            登录成功！
        `;
        
        document.body.appendChild(successMessage);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (successMessage.parentNode) {
                        successMessage.parentNode.removeChild(successMessage);
                    }
                }, 300);
            }
        }, 3000);
    }

    // 检查是否已登录
    isLoggedIn() {
        return !!this.currentUser;
    }

    // 获取当前用户信息
    getCurrentUser() {
        return this.currentUser;
    }

    // 用户注销
    logout() {
        try {
            // 清除用户登录状态
            sessionStorage.removeItem('currentUser');
            this.currentUser = null;
            this.updateUI();
            
            // 显示注销成功消息
            this.showLogoutSuccess();
            
            // 延迟1秒后跳转到登录页面
            setTimeout(() => {
                window.location.href = '/html/login.html';
            }, 1000);
            
            return true;
        } catch (error) {
            console.error('注销失败:', error);
            return false;
        }
    }

    // 显示注销成功消息
    showLogoutSuccess() {
        // 创建临时成功消息
        const successMessage = document.createElement('div');
        successMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--info);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            font-weight: 500;
        `;
        successMessage.innerHTML = `
            <span style="margin-right: 8px;">👋</span>
            已成功注销！
        `;
        
        document.body.appendChild(successMessage);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (successMessage.parentNode) {
                        successMessage.parentNode.removeChild(successMessage);
                    }
                }, 300);
            }
        }, 3000);
    }
}

// 创建用户状态管理器实例
console.log('Creating UserStatusManager instance...');
const userStatusManager = new UserStatusManager();
console.log('UserStatusManager instance created:', userStatusManager);

// 立即调用一次updateUI确保界面正确初始化
if (userStatusManager && typeof userStatusManager.updateUI === 'function') {
    console.log('Immediately calling updateUI() after instance creation');
    userStatusManager.updateUI();
}

// 添加全局变量以便调试
window.userStatusManager = userStatusManager;

// 导航栏交互功能
class NavigationManager {
    constructor() {
        this.currentSection = 'home';
        this.init();
    }
    
    init() {
        this.setupNavigationEvents();
        this.setupLogoutButton();
        this.setupSectionScroll();
        this.setupMobileMenu();
    }
    
    setupNavigationEvents() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.switchSection(section);
            });
        });
    }
    
    setupLogoutButton() {
        // 移除首页的登出确认对话框，使用 common-layout.js 中的统一登出逻辑
        // 保持按钮的默认行为，让 common-layout.js 处理
    }

    // 设置移动端菜单功能
    setupMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMobileMenu();
            });

            // 点击导航链接时关闭移动菜单
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (this.isMobileMenuOpen()) {
                        this.closeMobileMenu();
                    }
                });
            });

            // 点击页面其他区域关闭移动菜单
            document.addEventListener('click', (e) => {
                if (this.isMobileMenuOpen() && 
                    !navMenu.contains(e.target) && 
                    !mobileMenuToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });

            // 监听窗口大小变化
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768 && this.isMobileMenuOpen()) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    // 切换移动端菜单
    toggleMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (mobileMenuToggle && navMenu) {
            if (this.isMobileMenuOpen()) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }

    // 检查移动端菜单是否打开
    isMobileMenuOpen() {
        const navMenu = document.getElementById('navMenu');
        return navMenu && navMenu.classList.contains('mobile-open');
    }

    // 打开移动端菜单
    openMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.classList.add('active');
            navMenu.classList.add('mobile-open');
            
            // 添加动画效果
            navMenu.style.animation = 'slideInDown 0.3s ease';
        }
    }

    // 关闭移动端菜单
    closeMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.classList.remove('active');
            
            // 添加关闭动画
            navMenu.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                navMenu.classList.remove('mobile-open');
                navMenu.style.animation = '';
            }, 300);
        }
    }
    
    setupSectionScroll() {
        // 监听滚动事件，自动切换导航栏激活状态
        window.addEventListener('scroll', () => {
            this.updateActiveSection();
        });
    }
    
    switchSection(section) {
        // 移除所有激活状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // 添加当前激活状态
        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        this.currentSection = section;
        this.scrollToSection(section);
    }
    
    scrollToSection(section) {
        const targetElement = document.getElementById(section);
        if (targetElement) {
            targetElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    updateActiveSection() {
        const sections = ['home', 'delivery', 'route', 'profile'];
        const scrollPosition = window.scrollY + 100;
        
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const element = document.getElementById(section);
            if (element) {
                const offsetTop = element.offsetTop;
                const offsetHeight = element.offsetHeight;
                
                if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                    if (this.currentSection !== section) {
                        this.switchSection(section);
                    }
                    break;
                }
            }
        }
    }
}

// 创建导航管理器实例
const navigationManager = new NavigationManager();
window.navigationManager = navigationManager;

// 添加手动测试函数
window.testUserStatus = function() {
    console.log('=== 手动测试用户状态 ===');
    console.log('sessionStorage currentUser:', sessionStorage.getItem('currentUser'));
    console.log('userStatusManager.currentUser:', userStatusManager.currentUser);
    console.log('profileNav element:', document.getElementById('profileNav'));
    console.log('authNav element:', document.getElementById('authNav'));
    
    // 强制刷新界面
    userStatusManager.updateUI();
};

// 添加模拟登录函数用于测试
window.testLogin = function() {
    console.log('=== 模拟登录测试 ===');
    const testUser = {
        id: 1,
        username: '测试用户',
        phone: '19851663611'
    };
    sessionStorage.setItem('currentUser', JSON.stringify(testUser));
    console.log('已设置测试用户数据到sessionStorage');
    userStatusManager.updateUI();
    console.log('界面已刷新，请检查个人主页链接是否显示');
};

// 添加强制刷新函数
window.forceRefreshUI = function() {
    console.log('=== 强制刷新界面 ===');
    userStatusManager.loadUserStatus();
    userStatusManager.updateUI();
};

// 添加用户名按钮状态检查函数
window.checkUsernameButton = function() {
    console.log('=== 用户名按钮状态检查 ===');
    const profileNav = document.getElementById('profileNav');
    const profileLink = profileNav ? profileNav.querySelector('.profile-link') : null;
    const usernameElement = profileNav ? profileNav.querySelector('.user-status-username') : null;
    
    if (profileLink && usernameElement) {
        console.log('profileLink 元素:', profileLink);
        console.log('usernameElement 元素:', usernameElement);
        console.log('profileLink disabled 属性:', profileLink.disabled);
        console.log('profileLink style.cursor:', profileLink.style.cursor);
        console.log('profileLink style.pointerEvents:', profileLink.style.pointerEvents);
        console.log('usernameElement style.cursor:', usernameElement.style.cursor);
        console.log('usernameElement style.pointerEvents:', usernameElement.style.pointerEvents);
        
        // 检查事件监听器
        console.log('profileLink onclick:', profileLink.onclick);
        console.log('usernameElement onclick:', usernameElement.onclick);
        
        // 检查CSS计算样式
        const computedStyle = window.getComputedStyle(profileLink);
        console.log('profileLink 计算样式 cursor:', computedStyle.cursor);
        console.log('profileLink 计算样式 pointer-events:', computedStyle.pointerEvents);
        
        // 检查z-index
        console.log('profileLink z-index:', computedStyle.zIndex);
        
        // 检查是否有父元素遮挡
        let parent = profileLink.parentElement;
        while (parent) {
            const parentStyle = window.getComputedStyle(parent);
            if (parentStyle.pointerEvents === 'none') {
                console.log('发现遮挡父元素:', parent);
            }
            parent = parent.parentElement;
        }
    } else {
        console.log('未找到相关元素');
        console.log('profileNav:', profileNav);
        console.log('profileLink:', profileLink);
        console.log('usernameElement:', usernameElement);
    }
};

// 初始化配送任务
function initDeliveryTasks() {
    deliveryTaskManager.loadDeliveryTasks();
}

// 页面加载完成后初始化
window.onload = function() {
  try {
    console.log('window.onload triggered');
    
    // 立即滚动到页面顶部，确保页面加载时滚动位置正确
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // 性能监控 - 记录页面加载时间
    const loadStartTime = performance.now();
    
    // 初始化RoutePlanner
    window.routePlanner = new RoutePlanner();
    
    // 页面加载完成后自动获取当前位置
    if (window.routePlanner && typeof window.routePlanner.getCurrentLocation === 'function') {
      window.routePlanner.getCurrentLocation();
    }
    
    // 初始化配送任务
    if (typeof initDeliveryTasks === 'function') {
      initDeliveryTasks();
    }
    
    // 绑定规划路线按钮事件
    const planRouteBtn = document.getElementById('planRouteBtn');
    if (planRouteBtn && typeof planRoute === 'function') {
      planRouteBtn.addEventListener('click', planRoute);
    }
    
    // 初始化装饰元素动画
    if (typeof initDecorativeElements === 'function') {
      initDecorativeElements();
    }
    
    // 初始化用户状态界面（重要：确保遮罩层正确显示）
    console.log('Before userStatusManager.updateUI()');
    if (userStatusManager && typeof userStatusManager.updateUI === 'function') {
      console.log('Calling userStatusManager.updateUI()');
      userStatusManager.updateUI();
    } else {
      console.error('userStatusManager not available or updateUI not a function');
    }
    
    // 初始化AI助手
    try {
      window.aiAssistant = new AIAssistant();
      console.log('AI助手初始化成功');
    } catch (error) {
      console.error('AI助手初始化失败:', error);
    }
    
    // 性能监控 - 记录页面加载完成时间
    const loadEndTime = performance.now();
    console.log(`页面加载完成时间: ${(loadEndTime - loadStartTime).toFixed(2)}ms`);
    
    // 添加性能监控
    if (typeof setupPerformanceMonitoring === 'function') {
      setupPerformanceMonitoring();
    }
  } catch (error) {
    console.error('页面初始化失败:', error);
    // 显示友好的错误提示
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      text-align: center;
    `;
    errorMessage.innerHTML = `
      <h3 style="color: #ff4d4f; margin-bottom: 10px;">页面初始化失败</h3>
      <p style="margin-bottom: 15px; color: #666;">请刷新页面重试</p>
      <button onclick="location.reload()" style="background: #1890ff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
        刷新页面
      </button>
    `;
    document.body.appendChild(errorMessage);
  }
};