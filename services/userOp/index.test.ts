jest.mock('../../config', () => ({
    ENTRYPOINT_CONTRACT_ADDRESS: '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789',
    TX_WAIT: true,
   }));
import { sendUserOperation } from './index';
import { getWalletManagerInstance } from '../walletManager/singleton';
import { encodeFunctionData } from 'viem';
import config from '../../config';

jest.mock('../walletManager/singleton');
jest.mock('viem');

describe('sendUserOperation', () => {
 beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
 });

 it('should send a user operation successfully', async () => {
    const mockWalletManager = {
      getWalletAddress: jest.fn().mockResolvedValue('0xBeneficiary'),
      redundancySendTransaction: jest.fn().mockResolvedValue('0xTransactionHash'),
    };
    (getWalletManagerInstance as jest.Mock).mockReturnValue(mockWalletManager);

    const mockEncodeFunctionData = jest.fn().mockReturnValue('0xEncodedData');
    (encodeFunctionData as jest.Mock).mockImplementation(mockEncodeFunctionData);

    const userOp = { id: 1, type: 'test' };
    const result = await sendUserOperation(userOp);

    expect(mockWalletManager.getWalletAddress).toHaveBeenCalledWith(-1);
    expect(mockEncodeFunctionData).toHaveBeenCalledWith({
      abi: expect.any(Array),
      functionName: 'handleOps',
      args: [[userOp], '0xBeneficiary'],
    });
    expect(mockWalletManager.redundancySendTransaction).toHaveBeenCalledWith(
      {
        to: config.ENTRYPOINT_CONTRACT_ADDRESS,
        data: '0xEncodedData',
      },
      2,
      config.TX_WAIT
    );
    expect(result).toEqual({ result: '0xTransactionHash' });
 });

    it('should throw an error if an error occurs', async () => {
        const mockWalletManager = {
        getWalletAddress: jest.fn().mockResolvedValue('0xBeneficiary'),
        redundancySendTransaction: jest.fn().mockRejectedValue(new Error('Test error')),
        };
        (getWalletManagerInstance as jest.Mock).mockReturnValue(mockWalletManager);
    
        const userOp = { id: 1, type: 'test' };
    
        await expect(sendUserOperation(userOp)).rejects.toThrow('An error occurred while sending the UserOperation');
    });


});