// 3D Model Viewer using Three.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class ModelViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight || 400;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f172a);

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(0, 2, 5);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 2;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x8b5cf6, 1, 100);
        pointLight.position.set(-5, 5, -5);
        this.scene.add(pointLight);

        // Grid helper
        const gridHelper = new THREE.GridHelper(10, 10, 0x334155, 0x1e293b);
        this.scene.add(gridHelper);

        // Handle resize
        window.addEventListener('resize', () => this.onResize());

        this.isInitialized = true;
        this.animate();
    }

    loadModel(modelPath) {
        const loader = new GLTFLoader();

        // Show loading state
        this.showLoading(true);

        loader.load(
            modelPath,
            (gltf) => {
                // Remove existing model
                if (this.model) {
                    this.scene.remove(this.model);
                }

                this.model = gltf.scene;

                // Center and scale the model
                const box = new THREE.Box3().setFromObject(this.model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxDim;
                this.model.scale.setScalar(scale);

                this.model.position.sub(center.multiplyScalar(scale));
                this.model.position.y = 0;

                // Enable shadows
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.scene.add(this.model);
                this.showLoading(false);

                console.log('Model loaded successfully:', modelPath);
            },
            (progress) => {
                const percent = (progress.loaded / progress.total * 100).toFixed(0);
                console.log(`Loading: ${percent}%`);
            },
            (error) => {
                console.error('Error loading model:', error);
                this.showLoading(false);
                this.showError('Gagal memuat model 3D');
            }
        );
    }

    showLoading(show) {
        let loader = this.container.querySelector('.model-loader');
        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.className = 'model-loader';
                loader.innerHTML = `
                    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.8);z-index:10;">
                        <div style="text-align:center;">
                            <div style="width:40px;height:40px;border:4px solid #334155;border-top-color:#8b5cf6;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>
                            <span style="color:#94a3b8;">Memuat model 3D...</span>
                        </div>
                    </div>
                    <style>@keyframes spin{to{transform:rotate(360deg);}}</style>
                `;
                this.container.appendChild(loader);
            }
        } else if (loader) {
            loader.remove();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.8);">
                <span style="color:#f87171;">${message}</span>
            </div>
        `;
        this.container.appendChild(errorDiv);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight || 400;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
        this.isInitialized = false;
    }
}

// Export for use in other scripts
window.ModelViewer = ModelViewer;

// Initialize when dashboard is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create a global instance that can be used later
    window.model3DViewer = null;
});
