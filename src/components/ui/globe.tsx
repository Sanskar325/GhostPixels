"use client";
import { useEffect, useRef, useState } from "react";
import { Color, Scene, Fog, PerspectiveCamera, Vector3, WebGLRenderer, AmbientLight, DirectionalLight, PointLight } from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import countries from "@/data/globe.json";

const RING_PROPAGATION_SPEED = 3;
const aspect = 1.2;
const cameraZ = 300;

type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: {
    lat: number;
    lng: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}

let numbersOfRings = [0];

export function World({ globeConfig, data }: WorldProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const {
        pointSize = 1,
        atmosphereColor = "#ffffff",
        showAtmosphere = true,
        atmosphereAltitude = 0.1,
        polygonColor = "rgba(255,255,255,0.7)",
        globeColor = "#1d072e",
        emissive = "#000000",
        emissiveIntensity = 0.1,
        shininess = 0.9,
        arcTime = 2000,
        arcLength = 0.9,
        rings = 1,
        maxRings = 3,
        ambientLight = "#ffffff",
        directionalLeftLight = "#ffffff",
        directionalTopLight = "#ffffff",
        pointLight = "#ffffff",
        autoRotate = true,
        autoRotateSpeed = 1,
    } = globeConfig;

    const scene = new Scene();
    const camera = new PerspectiveCamera(50, aspect, 180, 1800);
    camera.position.z = cameraZ;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mountRef.current.offsetWidth, mountRef.current.offsetHeight);
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new AmbientLight(ambientLight, 0.6));
    const dl = new DirectionalLight(directionalLeftLight, 0.8);
    dl.position.set(-400, 100, 400);
    scene.add(dl);
    const d2 = new DirectionalLight(directionalTopLight, 0.8);
    d2.position.set(-200, 500, 200);
    scene.add(d2);
    const p1 = new PointLight(pointLight, 0.5);
    p1.position.set(-200, 500, 200);
    scene.add(p1);

    const globe = new ThreeGlobe();
    scene.add(globe);

    const globeMaterial = globe.globeMaterial() as any;
    globeMaterial.color = new Color(globeColor);
    globeMaterial.emissive = new Color(emissive);
    globeMaterial.emissiveIntensity = emissiveIntensity;
    globeMaterial.shininess = shininess;

    let points: any[] = [];
    data.forEach(arc => {
        points.push({ size: pointSize, order: arc.order, color: arc.color, lat: arc.startLat, lng: arc.startLng });
        points.push({ size: pointSize, order: arc.order, color: arc.color, lat: arc.endLat, lng: arc.endLng });
    });
    const filteredPoints = points.filter((v, i, a) => a.findIndex(v2 => v2.lat === v.lat && v2.lng === v.lng) === i);

    globe
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(showAtmosphere)
      .atmosphereColor(atmosphereColor)
      .atmosphereAltitude(atmosphereAltitude)
      .hexPolygonColor(() => polygonColor);
    
    globe
      .arcsData(data)
      .arcStartLat(d => (d as { startLat: number }).startLat)
      .arcStartLng(d => (d as { startLng: number }).startLng)
      .arcEndLat(d => (d as { endLat: number }).endLat)
      .arcEndLng(d => (d as { endLng: number }).endLng)
      .arcColor(e => (e as { color: string }).color)
      .arcAltitude(e => (e as { arcAlt: number }).arcAlt)
      .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
      .arcDashLength(arcLength)
      .arcDashInitialGap(e => (e as { order: number }).order)
      .arcDashGap(15)
      .arcDashAnimateTime(() => arcTime);

    globe
      .pointsData(filteredPoints)
      .pointColor(e => (e as { color: string }).color)
      .pointsMerge(true)
      .pointAltitude(0.0)
      .pointRadius(2);

    globe
      .ringsData([])
      .ringColor((e: any) => (e as { color: string }).color)
      .ringMaxRadius(maxRings)
      .ringPropagationSpeed(RING_PROPAGATION_SPEED)
      .ringRepeatPeriod((arcTime * arcLength) / rings);

    const ringInterval = setInterval(() => {
        numbersOfRings = genRandomNumbers(0, data.length, Math.floor((data.length * 4) / 5));
        globe.ringsData(data.filter((d, i) => numbersOfRings.includes(i)));
    }, 2000);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minDistance = cameraZ;
    controls.maxDistance = cameraZ;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = autoRotateSpeed;
    controls.minPolarAngle = Math.PI / 3.5;
    controls.maxPolarAngle = Math.PI - Math.PI / 3;

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
    
    const handleResize = () => {
        if(mountRef.current) {
            const width = mountRef.current.offsetWidth;
            const height = mountRef.current.offsetHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(ringInterval);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [globeConfig, data]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}

export function hexToRgb(hex: string) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function genRandomNumbers(min: number, max: number, count: number) {
  const arr = [];
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    if (arr.indexOf(r) === -1) arr.push(r);
  }
  return arr;
}
