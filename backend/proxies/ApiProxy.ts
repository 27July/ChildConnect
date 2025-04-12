// Proxy Pattern for API access
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

// Interface for API Service
export interface ApiService {
  get(endpoint: string, params?: Record<string, string>): Promise<any>;
  post(endpoint: string, data: any): Promise<any>;
  put(endpoint: string, data: any): Promise<any>;
  delete(endpoint: string): Promise<any>;
}

// Real API Service implementation
export class RealApiService implements ApiService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = `http://${ip}:8000`;
  }
  
  private async getAuthHeaders(): Promise<Headers> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in");
    }
    
    const token = await user.getIdToken();
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });
    
    return headers;
  }
  
  async get(endpoint: string, params?: Record<string, string>): Promise<any> {
    const headers = await this.getAuthHeaders();
    
    let url = `${this.baseUrl}/${endpoint}`;
    if (params) {
      const queryParams = new URLSearchParams(params);
      url += `?${queryParams}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async post(endpoint: string, data: any): Promise<any> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async put(endpoint: string, data: any): Promise<any> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async delete(endpoint: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
}

// Proxy for API Service with caching and error handling
export class ApiServiceProxy implements ApiService {
  private service: ApiService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly cacheTTL: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  constructor(service: ApiService) {
    this.service = service;
  }
  
  private getCacheKey(endpoint: string, params?: Record<string, string>): string {
    let key = endpoint;
    if (params) {
      const sortedParams = Object.entries(params).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
      key += `?${new URLSearchParams(sortedParams)}`;
    }
    return key;
  }
  
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTTL;
  }
  
  async get(endpoint: string, params?: Record<string, string>): Promise<any> {
    try {
      const cacheKey = this.getCacheKey(endpoint, params);
      const cachedItem = this.cache.get(cacheKey);
      
      // Return cached data if valid
      if (cachedItem && this.isCacheValid(cachedItem.timestamp)) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedItem.data;
      }
      
      // Cache miss or expired, call real service
      console.log(`Cache miss for ${cacheKey}`);
      const data = await this.service.get(endpoint, params);
      
      // Update cache
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error(`Error in GET ${endpoint}:`, error);
      throw error;
    }
  }
  
  async post(endpoint: string, data: any): Promise<any> {
    try {
      const result = await this.service.post(endpoint, data);
      
      // Invalidate cache for this endpoint after POST
      this.invalidateCache(endpoint);
      
      return result;
    } catch (error) {
      console.error(`Error in POST ${endpoint}:`, error);
      throw error;
    }
  }
  
  async put(endpoint: string, data: any): Promise<any> {
    try {
      const result = await this.service.put(endpoint, data);
      
      // Invalidate cache for this endpoint after PUT
      this.invalidateCache(endpoint);
      
      return result;
    } catch (error) {
      console.error(`Error in PUT ${endpoint}:`, error);
      throw error;
    }
  }
  
  async delete(endpoint: string): Promise<any> {
    try {
      const result = await this.service.delete(endpoint);
      
      // Invalidate cache for this endpoint after DELETE
      this.invalidateCache(endpoint);
      
      return result;
    } catch (error) {
      console.error(`Error in DELETE ${endpoint}:`, error);
      throw error;
    }
  }
  
  // Helper to invalidate cache entries that start with the given endpoint
  private invalidateCache(endpoint: string): void {
    for (const key of this.cache.keys()) {
      if (key === endpoint || key.startsWith(`${endpoint}?`)) {
        this.cache.delete(key);
      }
    }
  }
  
  // Clear the entire cache
  clearCache(): void {
    this.cache.clear();
    console.log('API cache cleared');
  }
}