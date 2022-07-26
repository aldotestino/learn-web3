import * as path from 'path';

export const RPC_URL = 'http://127.0.0.1:7545';
export const PRIVATE_KEY = '06566cfeac6b17d25ab36a6faef2eb020370e51e3273e3a4204737ca72057f84';
export const CONTRACT_ABI_PATH = path.join(__dirname, '..', 'compiled', 'SimpleStorage_sol_SimpleStorage.abi');
export const CONTRACT_BIN_PATH = path.join(__dirname, '..', 'compiled', 'SimpleStorage_sol_SimpleStorage.bin');