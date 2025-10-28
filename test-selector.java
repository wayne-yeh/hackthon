import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.Bytes32;
import java.util.Arrays;
import java.util.Collections;

public class TestSelector {
    public static void main(String[] args) {
        // Test function signature
        String functionSignature = "mint(address,string,bytes32)";
        
        // Create function with parameters
        Function function = new Function(functionSignature,
                Arrays.asList(
                        new Address(160, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
                        new Utf8String("ipfs://test"),
                        new Bytes32(new byte[32])),
                Collections.emptyList());
        
        String encoded = FunctionEncoder.encode(function);
        System.out.println("Function signature: " + functionSignature);
        System.out.println("Encoded data: " + encoded);
        System.out.println("Function selector (first 10 chars): " + encoded.substring(0, 10));
    }
}

