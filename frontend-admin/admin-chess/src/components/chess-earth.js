import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const EnhancedEarthGlobe = () => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Tạo scene
    const scene = new THREE.Scene();
    
    // Tỷ lệ khung hình
    const aspect = window.innerWidth > 500 ? 1 : window.innerWidth / 500;
    
    // Tạo camera với góc nhìn tốt hơn
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    camera.position.z = 7;
    
    // Tạo renderer với kích thước và chất lượng tốt hơn
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      precision: 'highp'
    });
    renderer.setSize(320, 320);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Thêm renderer vào container
    containerRef.current.appendChild(renderer.domElement);
    
    // Tạo loader cho textures
    const textureLoader = new THREE.TextureLoader();
    
    // Kích thước trái đất mới - nhỏ hơn một nửa
    const earthRadius = 1; // Thay vì 2 như ban đầu
    
    // Tạo Earth
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    
    // Tạo material cho đại dương với màu đẹp hơn
    const oceanMaterial = new THREE.MeshPhongMaterial({
      color: 0x0066aa,      // Màu xanh đậm hơn
      specular: 0x333333,   // Phản chiếu ánh sáng tốt hơn
      shininess: 80,        // Độ bóng cao hơn
      transparent: true,
      opacity: 0.92
    });
    
    const earth = new THREE.Mesh(earthGeometry, oceanMaterial);
    scene.add(earth);
    
    // Tạo hiệu ứng khí quyển
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.05, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x88bbff,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);
    
    // Tạo hiệu ứng phát sáng
    const glowGeometry = new THREE.SphereGeometry(earthRadius * 1.1, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4499ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);
    
    // Material cho lục địa đẹp hơn
    const landMaterial = new THREE.MeshLambertMaterial({
      color: 0x33aa66,  // Màu xanh lá tươi hơn
      transparent: true,
      opacity: 0.95
    });
    
    // Tạo lục địa với độ chính xác cao hơn
    const createContinent = (points, height = 0.03) => {
      const continentGroup = new THREE.Group();
      
      points.forEach(point => {
        const [lat, lon, scale = 1.0] = point;
        
        // Chuyển đổi tọa độ địa lý sang tọa độ 3D
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        
        // Vị trí trên bề mặt Trái Đất
        const x = -earthRadius * Math.sin(phi) * Math.cos(theta);
        const y = earthRadius * Math.cos(phi);
        const z = earthRadius * Math.sin(phi) * Math.sin(theta);
        
        // Tạo hình dạng lục địa
        const continentGeometry = new THREE.SphereGeometry(0.12 * scale, 16, 16);
        const continent = new THREE.Mesh(continentGeometry, landMaterial);
        
        // Đặt vị trí
        continent.position.set(x, y, z);
        
        // Xoay để khớp với bề mặt Trái Đất
        continent.lookAt(0, 0, 0);
        
        // Làm phẳng để tạo thành lục địa
        continent.scale.z = height;
        
        continentGroup.add(continent);
      });
      
      earth.add(continentGroup);
      return continentGroup;
    };
    
    // Dữ liệu lục địa (Vĩ độ, Kinh độ, Kích thước)
    
    // Bắc Mỹ
    createContinent([
      [40, -100, 1.5],
      [50, -100, 1.3],
      [30, -90, 1.2],
      [60, -110, 1.0],
      [45, -120, 1.1],
      [35, -105, 1.2]
    ]);
    
    // Nam Mỹ
    createContinent([
      [-10, -60, 1.2],
      [-20, -65, 1.0],
      [-30, -60, 0.9],
      [0, -70, 0.8],
      [-15, -55, 1.0]
    ]);
    
    // Châu Âu
    createContinent([
      [50, 10, 1.0],
      [55, 20, 0.8],
      [45, 15, 0.9],
      [60, 5, 0.7],
      [48, 2, 0.8]
    ]);
    
    // Châu Phi
    createContinent([
      [0, 20, 1.3],
      [10, 10, 1.2],
      [-10, 20, 1.1],
      [20, 30, 0.9],
      [5, 25, 1.0]
    ]);
    
    // Châu Á
    createContinent([
      [35, 100, 1.6],
      [45, 90, 1.4],
      [55, 80, 1.2],
      [25, 90, 1.3],
      [35, 70, 1.1],
      [30, 120, 1.0],
      [40, 110, 1.2]
    ]);
    
    // Châu Úc
    createContinent([
      [-25, 135, 1.0],
      [-30, 145, 0.8],
      [-20, 130, 0.9],
      [-25, 140, 0.8]
    ]);
    
    // Nam Cực
    createContinent([
      [-80, 0, 1.2],
      [-85, 90, 1.1],
      [-80, 180, 1.0],
      [-85, -90, 1.1],
      [-82, -45, 1.0]
    ], 0.02);
    
    // Tạo vệ tinh
    const createSatellite = (orbitRadius, orbitSpeed, color = 0xffffff, size = 0.05) => {
      const satelliteGroup = new THREE.Group();
      
      // Thân vệ tinh
      const bodyGeometry = new THREE.SphereGeometry(size, 8, 8);
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 100
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      satelliteGroup.add(body);
      
      // Tấm pin mặt trời
      const panelGeometry = new THREE.BoxGeometry(size * 4, size * 1.2, 0.01);
      const panelMaterial = new THREE.MeshPhongMaterial({
        color: 0x2266aa,
        shininess: 100
      });
      
      const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
      leftPanel.position.x = -size * 2.5;
      body.add(leftPanel);
      
      const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
      rightPanel.position.x = size * 2.5;
      body.add(rightPanel);
      
      // Anten
      const antennaGeometry = new THREE.CylinderGeometry(0.005, 0.005, size * 2);
      const antennaMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
      antenna.position.y = size * 1.2;
      antenna.rotation.x = Math.PI / 2;
      body.add(antenna);
      
      // Tạo đường quỹ đạo
      const orbitGeometry = new THREE.RingGeometry(orbitRadius, orbitRadius + 0.01, 96);
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2 + Math.random() * 0.8;
      orbit.rotation.y = Math.random() * Math.PI;
      scene.add(orbit);
      
      // Tham số quỹ đạo
      const tilt = orbit.rotation.x;
      const rotY = orbit.rotation.y;
      const phase = Math.random() * Math.PI * 2;
      
      satelliteGroup.userData = {
        orbitRadius,
        orbitSpeed,
        tilt,
        rotY,
        phase
      };
      
      scene.add(satelliteGroup);
      return satelliteGroup;
    };
    
    // Tạo 12 vệ tinh (tăng từ 5 lên 12) với màu và quỹ đạo khác nhau
    const satelliteColors = [
      0xffcc00, 0x00ccff, 0xff00cc, 0x00ffcc, 0xccff00,
      0xff3366, 0x3366ff, 0x66ff33, 0x33ff66, 0xff9900,
      0x9900ff, 0x00ff99
    ];
    
    const satellites = [];
    
    for (let i = 0; i < 12; i++) {
      // Bán kính quỹ đạo từ 2 đến 4
      const radius = 2 + i * 0.18;
      // Tốc độ từ 0.001 đến 0.003 (tăng nhanh hơn gấp đôi so với ban đầu)
      const speed = 0.001 + (Math.random() * 0.002);
      // Kích thước ngẫu nhiên từ 0.03 đến 0.08
      const size = 0.03 + Math.random() * 0.05;
      
      satellites.push(createSatellite(radius, speed, satelliteColors[i], size));
    }
    
    // Thêm các nguồn sáng tốt hơn
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    const ambientLight = new THREE.AmbientLight(0x666666); // Sáng hơn một chút
    scene.add(ambientLight);
    
    // Thêm ánh sáng nhẹ từ phía sau để tạo hiệu ứng viền sáng
    const backLight = new THREE.DirectionalLight(0x3366ff, 0.5);
    backLight.position.set(-5, -2, -5);
    scene.add(backLight);
    
    // Tạo hiệu ứng sao lấp lánh
    const createStars = () => {
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 1500; // Tăng số lượng sao
      
      const positions = new Float32Array(starCount * 3);
      const sizes = new Float32Array(starCount);
      
      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        
        // Vị trí ngẫu nhiên trên bầu trời
        positions[i3] = (Math.random() - 0.5) * 100;
        positions[i3 + 1] = (Math.random() - 0.5) * 100;
        positions[i3 + 2] = (Math.random() - 0.5) * 100;
        
        // Kích thước ngẫu nhiên
        sizes[i] = Math.random() * 2;
      }
      
      starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.12,
        transparent: true
      });
      
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
      
      return stars;
    };
    
    const stars = createStars();
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Xoay trái đất nhanh hơn (tăng 50%)
      earth.rotation.y += 0.003; // tăng từ 0.002 lên 0.003
      atmosphere.rotation.y += 0.0025; // tăng từ 0.0015 lên 0.0025
      glow.rotation.y += 0.0015; // tăng từ 0.001 lên 0.0015
      
      // Cập nhật vị trí các vệ tinh
      // Cập nhật vị trí các vệ tinh
      satellites.forEach(satellite => {
        const { orbitRadius, orbitSpeed, tilt, rotY, phase } = satellite.userData;
        const time = Date.now() * orbitSpeed + phase;
        
        // Tính toán vị trí trên quỹ đạo
        const x = Math.cos(time) * orbitRadius;
        const z = Math.sin(time) * orbitRadius;
        
        // Áp dụng độ nghiêng quỹ đạo
        satellite.position.x = x * Math.cos(rotY) - z * Math.sin(rotY);
        satellite.position.z = x * Math.sin(rotY) + z * Math.cos(rotY);
        satellite.position.y = Math.sin(time) * orbitRadius * Math.sin(tilt);
        
        // Xoay vệ tinh nhanh hơn
        satellite.rotation.y += 0.04; // tăng từ 0.02 lên 0.04
        satellite.rotation.z += 0.02; // tăng từ 0.01 lên 0.02
      });
      
      // Xoay camera nhẹ để tạo cảm giác chuyển động
      const cameraTime = Date.now() * 0.0001;
      camera.position.x = Math.sin(cameraTime) * 1;
      camera.position.z = Math.cos(cameraTime) * 1 + 7;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Xử lý khi resize cửa sổ
    const handleResize = () => {
      const width = Math.min(320, window.innerWidth);
      const aspect = width / 320;
      
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, 320);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Dọn dẹp
    return () => {
        window.removeEventListener('resize', handleResize);
        
        if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement);
        }
        
        // Giải phóng tài nguyên
        earthGeometry.dispose();
        oceanMaterial.dispose();
        atmosphereGeometry.dispose();
        atmosphereMaterial.dispose();
        glowGeometry.dispose();
        glowMaterial.dispose();
        landMaterial.dispose();
        
        // Giải phóng tài nguyên vệ tinh và quỹ đạo
        satellites.forEach(satellite => {
          scene.remove(satellite);
        });
        
        scene.remove(stars);
        scene.remove(earth);
        scene.remove(atmosphere);
        scene.remove(glow);
        
        renderer.dispose();
      };
    }, []);
    
    return (
      <div className="flex flex-col items-center">
        <div ref={containerRef} className="w-[320px] h-[320px]" />
        {/* <span className="bg-gray-300 animate-pulse">Đang tìm đối thủ...</span> */}
      </div>
    );
  };
  
  export default EnhancedEarthGlobe;