package com.medisync.service;

import com.medisync.dto.LoginRequest;
import com.medisync.dto.LoginResponse;
import com.medisync.entity.Patient;
import com.medisync.entity.User;
import com.medisync.repository.PatientRepository;
import com.medisync.repository.UserRepository;
import com.medisync.security.JwtTokenProvider;
import com.medisync.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();

        String name = user.getUsername();
        String umrn = null;

        if ("ROLE_PATIENT".equals(user.getRole())) {
            Optional<Patient> patientOpt = patientRepository.findByUserUsername(user.getUsername());
            if (patientOpt.isPresent()) {
                name = patientOpt.get().getName();
                umrn = patientOpt.get().getUmrn();
            }
        } else {
            name = "Hospital Admin";
        }

        return LoginResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .role(user.getRole())
                .name(name)
                .umrn(umrn)
                .build();
    }
}
