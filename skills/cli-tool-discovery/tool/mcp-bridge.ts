#!/usr/bin/env node

/**
 * MCP Bridge Layer
 * Bridges MCPorter's MCP discovery system with our CLI tool discovery
 * Provides unified access to both system CLI tools and MCP servers
 */

import { createRuntime } from '@mcporter/runtime';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Types
interface MCPServer {
  name: string;
  description?: string;
  tools: MCPTool[];
  status: 'connected' | 'disconnected' | 'error';
}

interface MCPTool {
  name: string;
  description?: string;
  parameters?: any;
}

interface SystemTool {
  name: string;
  description: string;
  location: string;
  version: string;
  available: boolean;
}

interface UnifiedTool {
  name: string;
  type: 'system' | 'mcp';
  description: string;
  available: boolean;
  location?: string;
  version?: string;
  server?: string;
  category?: string;
  examples?: string[];
}

export class MCPBridge {
  private runtime: any;
  private mcpServers: Map<string, MCPServer> = new Map();
  private systemTools: Map<string, SystemTool> = new Map();
  private configDir: string;

  constructor() {
    this.configDir = path.join(os.homedir(), '.claude', 'cli-tool-discovery');
    this.ensureConfigDir();
  }

  private ensureConfigDir(): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  /**
   * Initialize MCPorter runtime and discover MCP servers
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔧 Initializing MCPorter runtime...');
      this.runtime = createRuntime({
        // MCPorter configuration options
        timeout: 10000,
        retries: 3,
      });

      await this.discoverMCPServers();
      await this.discoverSystemTools();

      console.log('✅ MCP Bridge initialized successfully');
    } catch (error) {
      console.warn('⚠️  MCPorter runtime initialization failed:', error);
      console.log('📦 Falling back to system tools only');
      await this.discoverSystemTools();
    }
  }

  /**
   * Discover MCP servers from various configuration sources
   */
  private async discoverMCPServers(): Promise<void> {
    const configPaths = [
      path.join(os.homedir(), '.config', 'cursor', 'mcp.json'),
      path.join(os.homedir(), '.config', 'claude', 'mcp.json'),
      path.join(os.homedir(), '.config', 'codex', 'mcp.json'),
      path.join(os.homedir(), '.claude', 'mcp.json'),
      path.join(process.cwd(), '.claude', 'mcp.json'),
    ];

    for (const configPath of configPaths) {
      if (fs.existsSync(configPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          await this.loadMCPServersFromConfig(config);
        } catch (error) {
          console.warn(`⚠️  Failed to load MCP config from ${configPath}:`, error);
        }
      }
    }
  }

  /**
   * Load MCP servers from configuration
   */
  private async loadMCPServersFromConfig(config: any): Promise<void> {
    if (!config.mcpServers) return;

    for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
      try {
        const tools = await this.discoverMCPTools(name, serverConfig);
        this.mcpServers.set(name, {
          name,
          description: (serverConfig as any).description,
          tools,
          status: 'connected'
        });
      } catch (error) {
        this.mcpServers.set(name, {
          name,
          description: (serverConfig as any).description,
          tools: [],
          status: 'error'
        });
        console.warn(`⚠️  Failed to connect to MCP server ${name}:`, error);
      }
    }
  }

  /**
   * Discover tools from a specific MCP server
   */
  private async discoverMCPTools(serverName: string, serverConfig: any): Promise<MCPTool[]> {
    try {
      // This would use MCPorter's tool discovery
      // For now, return placeholder tools
      return [
        {
          name: `${serverName}_tool1`,
          description: `Example tool from ${serverName}`,
        },
        {
          name: `${serverName}_tool2`,
          description: `Another tool from ${serverName}`,
        }
      ];
    } catch (error) {
      console.error(`Error discovering tools for ${serverName}:`, error);
      return [];
    }
  }

  /**
   * Discover system CLI tools
   */
  private async discoverSystemTools(): Promise<void> {
    const commonTools = [
      'git', 'npm', 'yarn', 'pnpm', 'npx', 'jq', 'curl', 'wget',
      'ping', 'netstat', 'ss', 'traceroute', 'ssh', 'nc', 'ps',
      'top', 'htop', 'lsof', 'find', 'locate', 'which', 'whereis',
      'grep', 'sed', 'awk', 'sort', 'uniq', 'tar', 'zip', 'unzip',
      'gzip', 'gunzip', 'rsync', 'docker', 'docker-compose', 'podman',
      'kubectl', 'helm', 'aws', 'gcloud', 'az', 'terraform', 'ansible',
      'man', 'tldr', 'info'
    ];

    for (const toolName of commonTools) {
      const tool = await this.getSystemToolInfo(toolName);
      this.systemTools.set(toolName, tool);
    }
  }

  /**
   * Get detailed information about a system tool
   */
  private async getSystemToolInfo(toolName: string): Promise<SystemTool> {
    return new Promise((resolve) => {
      const { exec } = require('child_process');

      exec(`which ${toolName}`, (error: any, stdout: string) => {
        const location = stdout.trim();
        const available = !error && location.length > 0;

        if (available) {
          // Try to get version information
          exec(`${toolName} --version 2>/dev/null || ${toolName} -V 2>/dev/null || echo "Unknown"`,
            (versionError: any, versionStdout: string) => {
            resolve({
              name: toolName,
              description: this.getToolDescription(toolName),
              location,
              version: versionStdout.trim() || 'Unknown',
              available: true
            });
          });
        } else {
          resolve({
            name: toolName,
            description: this.getToolDescription(toolName),
            location: 'Not installed',
            version: 'N/A',
            available: false
          });
        }
      });
    });
  }

  /**
   * Get description for a tool
   */
  private getToolDescription(toolName: string): string {
    const descriptions: { [key: string]: string } = {
      'git': 'Version control system',
      'npm': 'Node.js package manager',
      'jq': 'JSON processor and formatter',
      'curl': 'Data transfer utility',
      'docker': 'Container platform',
      'kubectl': 'Kubernetes CLI',
      'aws': 'Amazon Web Services CLI',
      'gh': 'GitHub CLI',
      // Add more descriptions as needed
    };

    return descriptions[toolName] || `${toolName} command line tool`;
  }

  /**
   * Get all tools (system + MCP) as unified interface
   */
  async getAllTools(): Promise<UnifiedTool[]> {
    const tools: UnifiedTool[] = [];

    // Add system tools
    for (const [name, tool] of this.systemTools) {
      tools.push({
        name,
        type: 'system',
        description: tool.description,
        available: tool.available,
        location: tool.location,
        version: tool.version,
        category: this.categorizeTool(name)
      });
    }

    // Add MCP tools
    for (const [serverName, server] of this.mcpServers) {
      for (const mcpTool of server.tools) {
        tools.push({
          name: mcpTool.name,
          type: 'mcp',
          description: mcpTool.description || '',
          available: server.status === 'connected',
          server: serverName,
          category: 'mcp'
        });
      }
    }

    return tools.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Categorize tools by functionality
   */
  private categorizeTool(toolName: string): string {
    const categories: { [key: string]: string[] } = {
      'development': ['git', 'npm', 'yarn', 'pnpm', 'npx', 'node', 'python', 'go', 'cargo'],
      'data-processing': ['jq', 'awk', 'sed', 'grep', 'sort', 'uniq'],
      'network': ['curl', 'wget', 'ping', 'netstat', 'ss', 'traceroute', 'ssh', 'nc'],
      'system': ['ps', 'top', 'htop', 'lsof', 'find', 'locate', 'which', 'whereis'],
      'archive': ['tar', 'zip', 'unzip', 'gzip', 'gunzip', 'rsync'],
      'container': ['docker', 'docker-compose', 'podman', 'kubectl', 'helm'],
      'cloud': ['aws', 'gcloud', 'az', 'terraform', 'ansible'],
      'documentation': ['man', 'tldr', 'info']
    };

    for (const [category, tools] of Object.entries(categories)) {
      if (tools.includes(toolName)) {
        return category;
      }
    }

    return 'other';
  }

  /**
   * Search tools by name or description
   */
  async searchTools(query: string): Promise<UnifiedTool[]> {
    const allTools = await this.getAllTools();
    const lowerQuery = query.toLowerCase();

    return allTools.filter(tool =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      (tool.category && tool.category.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get tools by category
   */
  async getToolsByCategory(category: string): Promise<UnifiedTool[]> {
    const allTools = await this.getAllTools();
    return allTools.filter(tool => tool.category === category);
  }

  /**
   * Get detailed information about a specific tool
   */
  async getToolInfo(toolName: string): Promise<UnifiedTool | null> {
    const allTools = await this.getAllTools();
    return allTools.find(tool => tool.name === toolName) || null;
  }

  /**
   * Save tool registry to cache
   */
  async saveRegistry(): Promise<void> {
    const registry = {
      timestamp: new Date().toISOString(),
      systemTools: Object.fromEntries(this.systemTools),
      mcpServers: Object.fromEntries(this.mcpServers),
    };

    const registryPath = path.join(this.configDir, 'tool-registry.json');
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  }

  /**
   * Load tool registry from cache
   */
  async loadRegistry(): Promise<boolean> {
    const registryPath = path.join(this.configDir, 'tool-registry.json');

    if (!fs.existsSync(registryPath)) {
      return false;
    }

    try {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      this.systemTools = new Map(Object.entries(registry.systemTools || {}));
      this.mcpServers = new Map(Object.entries(registry.mcpServers || {}));
      return true;
    } catch (error) {
      console.warn('⚠️  Failed to load tool registry:', error);
      return false;
    }
  }

  /**
   * Refresh tool discovery
   */
  async refresh(): Promise<void> {
    console.log('🔄 Refreshing tool discovery...');
    this.systemTools.clear();
    this.mcpServers.clear();
    await this.initialize();
    await this.saveRegistry();
    console.log('✅ Tool discovery refreshed');
  }
}

// CLI interface for the MCP bridge
async function main() {
  const bridge = new MCPBridge();
  const command = process.argv[2];

  try {
    switch (command) {
      case 'init':
        await bridge.initialize();
        await bridge.saveRegistry();
        break;

      case 'list':
        await bridge.loadRegistry() || await bridge.initialize();
        const tools = await bridge.getAllTools();
        console.log('Available Tools:');
        tools.forEach(tool => {
          const status = tool.available ? '✓' : '✗';
          const type = tool.type.toUpperCase().padEnd(6);
          console.log(`  ${status} ${type} ${tool.name.padEnd(20)} ${tool.description}`);
        });
        break;

      case 'search':
        if (!process.argv[3]) {
          console.error('Usage: mcp-bridge search <query>');
          process.exit(1);
        }
        await bridge.loadRegistry() || await bridge.initialize();
        const searchResults = await bridge.searchTools(process.argv[3]);
        console.log(`Search results for "${process.argv[3]}":`);
        searchResults.forEach(tool => {
          const status = tool.available ? '✓' : '✗';
          console.log(`  ${status} ${tool.name}: ${tool.description}`);
        });
        break;

      case 'refresh':
        await bridge.refresh();
        break;

      default:
        console.log(`
MCP Bridge - CLI Tool Discovery with MCPorter Integration

Usage:
  mcp-bridge init     Initialize and discover all tools
  mcp-bridge list     List all available tools
  mcp-bridge search <query>  Search for tools
  mcp-bridge refresh  Refresh tool discovery

Examples:
  mcp-bridge init
  mcp-bridge list
  mcp-bridge search "json"
  mcp-bridge search "docker"
        `);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}